import './App.css';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from './TopBar';
import MainText from './MainText';
import BottomBar from './BottomBar';

const PREFS_STORAGE_KEY = 'beowulf_prefs_v1';
const DEFAULT_PREFS = {
  fontSize: 'md',
  showLineNumbers: true,
  showSideNotes: true,
};

function loadPrefs() {
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      fontSize: ['sm', 'md', 'lg'].includes(parsed.fontSize) ? parsed.fontSize : 'md',
      showLineNumbers: typeof parsed.showLineNumbers === 'boolean' ? parsed.showLineNumbers : true,
      showSideNotes: typeof parsed.showSideNotes === 'boolean' ? parsed.showSideNotes : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function parsePositiveInt(raw, fallback) {
  const num = Number(raw);
  return Number.isInteger(num) && num >= 1 ? num : fallback;
}

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState({ totalChapters: 43, versions: [], chapters: [] });
  const [metaError, setMetaError] = useState(null);
  const [prefs, setPrefs] = useState(loadPrefs);

  const rawChapter = searchParams.get('c');
  const rawVersion = searchParams.get('v');
  const rawCompare = searchParams.get('v2');

  const chapter = useMemo(() => {
    const parsed = parsePositiveInt(rawChapter, 1);
    return Math.min(Math.max(1, parsed), meta.totalChapters || 43);
  }, [rawChapter, meta.totalChapters]);

  const version = useMemo(() => {
    if (!rawVersion) return 'as';
    if (meta.versions.length === 0) return rawVersion;
    return meta.versions.some((v) => v.id === rawVersion) ? rawVersion : 'as';
  }, [rawVersion, meta.versions]);

  const compareVersion = useMemo(() => {
    if (!rawCompare) return null;
    if (meta.versions.length === 0) return rawCompare;
    return meta.versions.some((v) => v.id === rawCompare) ? rawCompare : null;
  }, [rawCompare, meta.versions]);

  const fetchMeta = useCallback((signal) => {
    setMetaError(null);
    return fetch('/api/meta', { signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load metadata (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setMeta(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setMetaError(err.message || 'Could not load metadata.');
        }
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchMeta(controller.signal);
    return () => controller.abort();
  }, [fetchMeta]);

  // Normalize invalid URL parameters once metadata loads
  useEffect(() => {
    if (meta.versions.length === 0) return;
    const validChapter = Math.min(Math.max(1, parsePositiveInt(rawChapter, 1)), meta.totalChapters);
    const validVersion = meta.versions.some((v) => v.id === rawVersion) ? rawVersion : 'as';
    const validCompare =
      rawCompare && meta.versions.some((v) => v.id === rawCompare) ? rawCompare : null;

    if (
      String(validChapter) !== rawChapter ||
      validVersion !== rawVersion ||
      (rawCompare && !validCompare)
    ) {
      const next = { c: String(validChapter), v: validVersion };
      if (validCompare) next.v2 = validCompare;
      setSearchParams(next, { replace: true });
    }
  }, [meta, rawChapter, rawVersion, rawCompare, setSearchParams]);

  // Persist reading preferences
  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }, [prefs]);

  // Update browser tab title dynamically
  useEffect(() => {
    const activeChap = meta.chapters.find((c) => c.number === chapter);
    if (activeChap) {
      document.title = `Beowulf — ${activeChap.roman}. ${activeChap.title}`;
    } else {
      document.title = 'Beowulf — Multi-Translation Reader';
    }
  }, [chapter, meta.chapters]);

  const updateUrl = useCallback(
    (nextChapter, nextVersion, nextCompare) => {
      const params = {
        c: String(nextChapter),
        v: nextVersion,
      };
      if (nextCompare) {
        params.v2 = nextCompare;
      }
      setSearchParams(params);
    },
    [setSearchParams]
  );

  const handleChapterChange = useCallback(
    (nextChapter) => {
      const clamped = Math.min(Math.max(1, nextChapter), meta.totalChapters || 43);
      if (clamped === chapter) return;
      updateUrl(clamped, version, compareVersion);
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [chapter, version, compareVersion, meta.totalChapters, updateUrl]
  );

  const handleVersionChange = useCallback(
    (nextVersion) => {
      updateUrl(chapter, nextVersion, compareVersion);
    },
    [chapter, compareVersion, updateUrl]
  );

  const handleCompareVersionChange = useCallback(
    (nextCompare) => {
      updateUrl(chapter, version, nextCompare);
    },
    [chapter, version, updateUrl]
  );

  const handleToggleCompare = useCallback(() => {
    if (compareVersion) {
      updateUrl(chapter, version, null);
    } else {
      const smartDefault = version === 'as' || version === 'hs' ? 'g' : 'as';
      updateUrl(chapter, version, smartDefault);
    }
  }, [chapter, version, compareVersion, updateUrl]);

  const handleUpdatePref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Global Left / Right arrow keyboard navigation
  useEffect(() => {
    function onKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const active = document.activeElement;
      if (
        active &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) || active.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'ArrowLeft' && chapter > 1) {
        event.preventDefault();
        handleChapterChange(chapter - 1);
      } else if (event.key === 'ArrowRight' && chapter < (meta.totalChapters || 43)) {
        event.preventDefault();
        handleChapterChange(chapter + 1);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chapter, meta.totalChapters, handleChapterChange]);

  return (
    <div className="app-shell">
      <TopBar
        version={version}
        compareVersion={compareVersion}
        versions={meta.versions}
        chapters={meta.chapters}
        chapter={chapter}
        totalChapters={meta.totalChapters}
        prefs={prefs}
        onUpdatePref={handleUpdatePref}
        onVersionChange={handleVersionChange}
        onChapterChange={handleChapterChange}
        onToggleCompare={handleToggleCompare}
      />

      {metaError && (
        <div className="error-banner" role="alert">
          <span>{metaError}</span>
          <button type="button" className="retry-btn" onClick={() => fetchMeta()}>
            Retry
          </button>
        </div>
      )}

      <MainText
        version={version}
        compareVersion={compareVersion}
        versions={meta.versions}
        chapter={chapter}
        chapters={meta.chapters}
        totalChapters={meta.totalChapters}
        prefs={prefs}
        onVersionChange={handleVersionChange}
        onCompareVersionChange={handleCompareVersionChange}
      />

      <BottomBar
        chapter={chapter}
        totalChapters={meta.totalChapters}
        chapters={meta.chapters}
        onChapterChange={handleChapterChange}
      />
    </div>
  );
}

export default App;
