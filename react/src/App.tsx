import './App.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BottomBar } from './BottomBar';
import { MainText } from './MainText';
import { TopBar } from './TopBar';
import { FontSize, ReaderMetadata, ReadingPreferences } from './types';

const PREFERENCES_STORAGE_KEY = 'beowulf_prefs_v1';
const DEFAULT_TOTAL_CHAPTERS = 43;
const DEFAULT_VERSION_ID = 'as';
const VALID_FONT_SIZES: readonly FontSize[] = ['sm', 'md', 'lg'];

const DEFAULT_PREFERENCES: ReadingPreferences = {
  fontSize: 'md',
  showLineNumbers: true,
  showSideNotes: true,
};

const INITIAL_METADATA: ReaderMetadata = {
  totalChapters: DEFAULT_TOTAL_CHAPTERS,
  versions: [],
  chapters: [],
};

function loadReadingPreferences(): ReadingPreferences {
  try {
    const rawValue = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(rawValue) as Partial<ReadingPreferences>;
    const fontSize =
      parsed.fontSize && VALID_FONT_SIZES.includes(parsed.fontSize)
        ? parsed.fontSize
        : DEFAULT_PREFERENCES.fontSize;
    return {
      fontSize,
      showLineNumbers:
        typeof parsed.showLineNumbers === 'boolean'
          ? parsed.showLineNumbers
          : DEFAULT_PREFERENCES.showLineNumbers,
      showSideNotes:
        typeof parsed.showSideNotes === 'boolean'
          ? parsed.showSideNotes
          : DEFAULT_PREFERENCES.showSideNotes,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function parsePositiveInt(
  rawValue: string | null,
  fallbackValue: number
): number {
  const parsedNumber = Number(rawValue);
  return Number.isInteger(parsedNumber) && parsedNumber >= 1
    ? parsedNumber
    : fallbackValue;
}

export function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [readerMetadata, setReaderMetadata] =
    useState<ReaderMetadata>(INITIAL_METADATA);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [readingPreferences, setReadingPreferences] =
    useState<ReadingPreferences>(loadReadingPreferences);

  const chapterParam = searchParams.get('c');
  const versionParam = searchParams.get('v');
  const compareVersionParam = searchParams.get('v2');

  const chapterNumber = useMemo(() => {
    const parsedChapter = parsePositiveInt(chapterParam, 1);
    const maxChapters = readerMetadata.totalChapters || DEFAULT_TOTAL_CHAPTERS;
    return Math.min(Math.max(1, parsedChapter), maxChapters);
  }, [chapterParam, readerMetadata.totalChapters]);

  const versionId = useMemo(() => {
    if (!versionParam) {
      return DEFAULT_VERSION_ID;
    }
    if (readerMetadata.versions.length === 0) {
      return versionParam;
    }
    return readerMetadata.versions.some((item) => item.id === versionParam)
      ? versionParam
      : DEFAULT_VERSION_ID;
  }, [versionParam, readerMetadata.versions]);

  const compareVersionId = useMemo(() => {
    if (!compareVersionParam) {
      return null;
    }
    if (readerMetadata.versions.length === 0) {
      return compareVersionParam;
    }
    return readerMetadata.versions.some(
      (item) => item.id === compareVersionParam
    )
      ? compareVersionParam
      : null;
  }, [compareVersionParam, readerMetadata.versions]);

  const fetchMetadata = useCallback((signal?: AbortSignal) => {
    setMetadataError(null);
    return fetch('/api/meta', { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load metadata (${response.status})`);
        }
        return response.json() as Promise<ReaderMetadata>;
      })
      .then((loadedMetadata) => {
        setReaderMetadata(loadedMetadata);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Could not load metadata.';
        setMetadataError(message);
      });
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchMetadata(abortController.signal);
    return () => abortController.abort();
  }, [fetchMetadata]);

  useEffect(() => {
    if (readerMetadata.versions.length === 0) {
      return;
    }
    const validChapter = Math.min(
      Math.max(1, parsePositiveInt(chapterParam, 1)),
      readerMetadata.totalChapters
    );
    const validVersion =
      versionParam &&
      readerMetadata.versions.some((item) => item.id === versionParam)
        ? versionParam
        : DEFAULT_VERSION_ID;
    const validCompare =
      compareVersionParam &&
      readerMetadata.versions.some((item) => item.id === compareVersionParam)
        ? compareVersionParam
        : null;

    if (
      String(validChapter) !== chapterParam ||
      validVersion !== versionParam ||
      (compareVersionParam && !validCompare)
    ) {
      const nextParams: Record<string, string> = {
        c: String(validChapter),
        v: validVersion,
      };
      if (validCompare) {
        nextParams.v2 = validCompare;
      }
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    readerMetadata,
    chapterParam,
    versionParam,
    compareVersionParam,
    setSearchParams,
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(readingPreferences)
      );
    } catch {
      // Ignore storage quota or privacy mode errors.
    }
  }, [readingPreferences]);

  useEffect(() => {
    const activeChapter = readerMetadata.chapters.find(
      (item) => item.number === chapterNumber
    );
    document.title = activeChapter
      ? `Beowulf — ${activeChapter.roman}. ${activeChapter.title}`
      : 'Beowulf — Multi-Translation Reader';
  }, [chapterNumber, readerMetadata.chapters]);

  const updateUrlParams = useCallback(
    (
      nextChapter: number,
      nextVersionId: string,
      nextCompareVersionId: string | null
    ) => {
      const nextParams: Record<string, string> = {
        c: String(nextChapter),
        v: nextVersionId,
      };
      if (nextCompareVersionId) {
        nextParams.v2 = nextCompareVersionId;
      }
      setSearchParams(nextParams);
    },
    [setSearchParams]
  );

  const handleChapterChange = useCallback(
    (nextChapter: number) => {
      const maxChapters =
        readerMetadata.totalChapters || DEFAULT_TOTAL_CHAPTERS;
      const clampedChapter = Math.min(Math.max(1, nextChapter), maxChapters);
      if (clampedChapter === chapterNumber) {
        return;
      }
      updateUrlParams(clampedChapter, versionId, compareVersionId);
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    },
    [
      chapterNumber,
      versionId,
      compareVersionId,
      readerMetadata.totalChapters,
      updateUrlParams,
    ]
  );

  const handleVersionChange = useCallback(
    (nextVersionId: string) => {
      updateUrlParams(chapterNumber, nextVersionId, compareVersionId);
    },
    [chapterNumber, compareVersionId, updateUrlParams]
  );

  const handleCompareVersionChange = useCallback(
    (nextCompareVersionId: string) => {
      updateUrlParams(chapterNumber, versionId, nextCompareVersionId);
    },
    [chapterNumber, versionId, updateUrlParams]
  );

  const handleToggleCompare = useCallback(() => {
    if (compareVersionId) {
      updateUrlParams(chapterNumber, versionId, null);
      return;
    }
    const defaultCompareVersion =
      versionId === 'as' || versionId === 'hs' ? 'g' : 'as';
    updateUrlParams(chapterNumber, versionId, defaultCompareVersion);
  }, [chapterNumber, versionId, compareVersionId, updateUrlParams]);

  const handleUpdatePreference = useCallback(
    <K extends keyof ReadingPreferences>(
      key: K,
      value: ReadingPreferences[K]
    ) => {
      setReadingPreferences((previous) => ({ ...previous, [key]: value }));
    },
    []
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const activeElement = document.activeElement as HTMLElement | null;
      if (
        activeElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
          activeElement.isContentEditable)
      ) {
        return;
      }
      const maxChapters =
        readerMetadata.totalChapters || DEFAULT_TOTAL_CHAPTERS;
      if (event.key === 'ArrowLeft' && chapterNumber > 1) {
        event.preventDefault();
        handleChapterChange(chapterNumber - 1);
      } else if (event.key === 'ArrowRight' && chapterNumber < maxChapters) {
        event.preventDefault();
        handleChapterChange(chapterNumber + 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterNumber, readerMetadata.totalChapters, handleChapterChange]);

  return (
    <div className="app-shell">
      <TopBar
        versionId={versionId}
        compareVersionId={compareVersionId}
        versions={readerMetadata.versions}
        chapters={readerMetadata.chapters}
        chapterNumber={chapterNumber}
        totalChapters={readerMetadata.totalChapters}
        readingPreferences={readingPreferences}
        onUpdatePreference={handleUpdatePreference}
        onVersionChange={handleVersionChange}
        onChapterChange={handleChapterChange}
        onToggleCompare={handleToggleCompare}
      />

      {metadataError && (
        <div className="error-banner" role="alert">
          <span>{metadataError}</span>
          <button
            type="button"
            className="retry-btn"
            onClick={() => fetchMetadata()}
          >
            Retry
          </button>
        </div>
      )}

      <MainText
        versionId={versionId}
        compareVersionId={compareVersionId}
        versions={readerMetadata.versions}
        chapterNumber={chapterNumber}
        chapters={readerMetadata.chapters}
        readingPreferences={readingPreferences}
        onVersionChange={handleVersionChange}
        onCompareVersionChange={handleCompareVersionChange}
      />

      <BottomBar
        chapterNumber={chapterNumber}
        totalChapters={readerMetadata.totalChapters}
        chapters={readerMetadata.chapters}
        onChapterChange={handleChapterChange}
      />
    </div>
  );
}
