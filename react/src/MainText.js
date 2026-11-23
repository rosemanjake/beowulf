import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import ChapterTitle from './ChapterTitle';
import useOutsideAlerter from './OutsiderAlerter';

function renderTextContent(data, showLineNumbers) {
  if (!data) return null;

  if (data.isProse) {
    const paragraphs = data.text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div className="prosebody">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="proseparagraph">
            {para}
          </p>
        ))}
      </div>
    );
  }

  const lines = data.text.split('\n');
  const startLine = data.lineStart || 1;

  return (
    <div className="versebody">
      {lines.map((line, idx) => {
        const lineNo = startLine + idx;
        const displayNum = showLineNumbers && (idx === 0 || lineNo % 5 === 0) ? lineNo : '';
        return (
          <div key={idx} className="verseline">
            {showLineNumbers && (
              <span className="linenum" aria-hidden="true">
                {displayNum}
              </span>
            )}
            <span className="linetext">{line || '\u00A0'}</span>
          </div>
        );
      })}
    </div>
  );
}

function MainText({
  version,
  compareVersion,
  versions,
  chapter,
  chapters,
  totalChapters,
  prefs,
  onVersionChange,
  onCompareVersionChange,
}) {
  const [primaryData, setPrimaryData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [activeNote, setActiveNote] = useState(null);

  const primaryTextRef = useRef(null);

  const chapterMeta = chapters.find((c) => c.number === chapter);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setActiveNote(null);

    const primaryReq = fetch(`/api/chapter?v=${encodeURIComponent(version)}&c=${chapter}`, {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) throw new Error(`Failed to load chapter (${res.status})`);
      return res.json();
    });

    const compareReq = compareVersion
      ? fetch(`/api/chapter?v=${encodeURIComponent(compareVersion)}&c=${chapter}`, {
          signal: controller.signal,
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to load comparison text (${res.status})`);
          return res.json();
        })
      : Promise.resolve(null);

    Promise.all([primaryReq, compareReq])
      .then(([pData, cData]) => {
        setPrimaryData(pData);
        setCompareData(cData);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load chapter.');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [version, compareVersion, chapter, retryTick]);

  // Observe height of primary text block for proportional sidenote marker placement
  useEffect(() => {
    const el = primaryTextRef.current;
    if (!el) return undefined;

    const measure = () => setTextHeight(el.offsetHeight || el.scrollHeight || 0);
    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [primaryData, prefs.fontSize, prefs.showLineNumbers, compareVersion]);

  const handleSelectNote = useCallback((note) => {
    setActiveNote((prev) => (prev && prev.id === note.id ? null : note));
  }, []);

  const sidenotes = primaryData?.sidenotes || [];

  return (
    <main
      className={`maincontainer font-${prefs.fontSize} ${
        compareVersion ? 'maincontainer-compare' : ''
      }`}
      id="maincontainer"
    >
      <div className="readingframe">
        <div className="knotcolumn" aria-hidden="true" />

        <div className="readingarea">
          <ChapterTitle
            chapter={chapter}
            roman={primaryData?.roman || chapterMeta?.roman}
            title={primaryData?.title || chapterMeta?.title}
          />

          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="retry-btn"
                onClick={() => setRetryTick((t) => t + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {!primaryData && loading && (
            <div className="loading-placeholder" aria-live="polite">
              Loading fitt…
            </div>
          )}

          {primaryData && !compareVersion && (
            <div className="singlecolumn-layout">
              <div
                ref={primaryTextRef}
                id="text"
                className={`textsurface ${loading ? 'is-loading' : ''}`}
              >
                {renderTextContent(primaryData, prefs.showLineNumbers)}
              </div>

              {prefs.showSideNotes && sidenotes.length > 0 && (
                <SideNotes
                  chapHeight={textHeight}
                  notes={sidenotes}
                  activeNoteId={activeNote?.id || null}
                  onSelectNote={handleSelectNote}
                />
              )}
            </div>
          )}

          {primaryData && compareVersion && (
            <>
              <div className={`compare-grid ${loading ? 'is-loading' : ''}`}>
                <section className="compare-pane" aria-label="Primary translation pane">
                  <div className="compare-pane-header">
                    <select
                      aria-label="Primary translation"
                      className="compare-select"
                      value={version}
                      onChange={(e) => onVersionChange(e.target.value)}
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="textsurface">
                    {renderTextContent(primaryData, prefs.showLineNumbers)}
                  </div>
                </section>

                <section className="compare-pane" aria-label="Comparison translation pane">
                  <div className="compare-pane-header">
                    <select
                      aria-label="Comparison translation"
                      className="compare-select"
                      value={compareVersion}
                      onChange={(e) => onCompareVersionChange(e.target.value)}
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="textsurface">
                    {compareData ? (
                      renderTextContent(compareData, prefs.showLineNumbers)
                    ) : (
                      <div className="loading-placeholder">Loading comparison…</div>
                    )}
                  </div>
                </section>
              </div>

              {prefs.showSideNotes && sidenotes.length > 0 && (
                <details className="compare-notes">
                  <summary>Marginal Glosses ({sidenotes.length})</summary>
                  <ul className="compare-notes-list">
                    {sidenotes.map((note) => (
                      <li key={note.id}>{note.text}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      </div>

      {activeNote && !compareVersion && prefs.showSideNotes && (
        <Dialog note={activeNote} onClose={() => setActiveNote(null)} />
      )}
    </main>
  );
}

function SideNotes({ chapHeight, notes, activeNoteId, onSelectNote }) {
  const usableHeight = Math.max(0, chapHeight - 16);

  return (
    <aside className="sidenotes" aria-label="Marginal glosses">
      {notes.map((note, idx) => {
        const topPx = Math.round((usableHeight * note.position) / 100);
        const isActive = note.id === activeNoteId;
        return (
          <button
            key={note.id}
            type="button"
            data-note-id={note.id}
            className={`sidenotebutton ${isActive ? 'is-active' : ''}`}
            style={{ top: `${topPx}px` }}
            aria-label={`Marginal note ${idx + 1}`}
            aria-expanded={isActive}
            onClick={() => onSelectNote(note)}
          />
        );
      })}
    </aside>
  );
}

function Dialog({ note, onClose }) {
  const wrapperRef = useRef(null);
  const [pos, setPos] = useState({
    top: 120,
    left: undefined,
    right: 20,
    maxWidth: 300,
    side: 'left',
    arrowTop: 14,
  });

  useOutsideAlerter([wrapperRef], () => onClose(), true, '.sidenotebutton');

  useEffect(() => {
    const updatePos = () => {
      const marker = document.querySelector(`[data-note-id="${note.id}"]`);
      if (!marker) return;
      const rect = marker.getBoundingClientRect();
      const dialogHeight = wrapperRef.current?.offsetHeight || 64;
      const markerCenterY = rect.top + rect.height / 2;
      const spaceRight = window.innerWidth - rect.right - 16;

      const side = spaceRight >= 240 ? 'right' : 'left';
      const maxWidth =
        side === 'right'
          ? Math.min(300, Math.max(180, Math.floor(spaceRight - 10)))
          : Math.min(300, Math.max(180, Math.floor(rect.left - 24)));

      const minTop = 66;
      const maxTop = Math.max(minTop, window.innerHeight - dialogHeight - 16);
      const idealTop = markerCenterY - Math.min(dialogHeight / 2, 24);
      const top = Math.round(Math.min(Math.max(minTop, idealTop), maxTop));
      const arrowTop = Math.round(
        Math.min(Math.max(8, markerCenterY - top - 8), Math.max(8, dialogHeight - 24))
      );

      setPos({
        top,
        left: side === 'right' ? Math.round(rect.right + 10) : undefined,
        right: side === 'left' ? Math.round(window.innerWidth - rect.left + 10) : undefined,
        maxWidth,
        side,
        arrowTop,
      });
    };

    updatePos();
    const rafId = window.requestAnimationFrame(updatePos);
    window.addEventListener('scroll', updatePos, { passive: true });
    window.addEventListener('resize', updatePos, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updatePos);
      window.removeEventListener('resize', updatePos);
    };
  }, [note.id, note.text]);

  return (
    <div
      ref={wrapperRef}
      className={`dialogcontainer dialog-${pos.side}`}
      style={{
        top: `${pos.top}px`,
        left: pos.left !== undefined ? `${pos.left}px` : undefined,
        right: pos.right !== undefined ? `${pos.right}px` : undefined,
        maxWidth: `${pos.maxWidth}px`,
      }}
      role="dialog"
      aria-label="Marginal gloss"
    >
      {pos.side === 'right' && (
        <div
          className="dialogtriangle dialogtriangle-left"
          style={{ marginTop: `${pos.arrowTop}px` }}
          aria-hidden="true"
        />
      )}
      <div className="dialog">
        <div className="dialog-body">{note.text}</div>
        <button
          type="button"
          className="dialog-close"
          onClick={onClose}
          aria-label="Close note"
        >
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <path
              d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {pos.side === 'left' && (
        <div
          className="dialogtriangle dialogtriangle-right"
          style={{ marginTop: `${pos.arrowTop}px` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default memo(MainText);
