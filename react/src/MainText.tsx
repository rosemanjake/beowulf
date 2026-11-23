import { useCallback, useEffect, useRef, useState } from 'react';
import { ChapterTitle } from './ChapterTitle';
import {
  ChapterMetadata,
  ChapterPayload,
  ReadingPreferences,
  SideNote,
  VersionMetadata,
} from './types';
import { useOutsideClick } from './useOutsideClick';

const INITIAL_DIALOG_POSITION: DialogPosition = {
  top: 120,
  left: undefined,
  right: 20,
  maxWidth: 300,
  side: 'left',
  arrowTop: 14,
};

export interface MainTextProps {
  versionId: string;
  compareVersionId: string | null;
  versions: VersionMetadata[];
  chapterNumber: number;
  chapters: ChapterMetadata[];
  readingPreferences: ReadingPreferences;
  onVersionChange: (nextVersionId: string) => void;
  onCompareVersionChange: (nextCompareVersionId: string) => void;
}

interface SideNotesProps {
  chapterHeight: number;
  notes: SideNote[];
  activeNoteId: string | null;
  onSelectNote: (note: SideNote) => void;
}

interface DialogPosition {
  top: number;
  left?: number;
  right?: number;
  maxWidth: number;
  side: 'left' | 'right';
  arrowTop: number;
}

interface DialogProps {
  note: SideNote;
  onClose: () => void;
}

async function fetchChapterPayload(
  versionId: string,
  chapterNumber: number,
  signal: AbortSignal,
  errorLabel: string
): Promise<ChapterPayload> {
  const url = `/api/chapter?v=${encodeURIComponent(versionId)}&c=${chapterNumber}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${errorLabel} (${response.status})`);
  }
  return (await response.json()) as ChapterPayload;
}

function renderTextContent(
  chapterData: ChapterPayload | null,
  showLineNumbers: boolean
): JSX.Element | null {
  if (!chapterData) {
    return null;
  }

  if (chapterData.isProse) {
    const paragraphs = chapterData.text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    return (
      <div className="prosebody">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="proseparagraph">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  const lines = chapterData.text.split('\n');
  const startLine = chapterData.lineStart || 1;

  return (
    <div className="versebody">
      {lines.map((line, index) => {
        const lineNumber = startLine + index;
        const displayNumber =
          showLineNumbers && (index === 0 || lineNumber % 5 === 0)
            ? lineNumber
            : '';
        return (
          <div key={index} className="verseline">
            {showLineNumbers && (
              <span className="linenum" aria-hidden="true">
                {displayNumber}
              </span>
            )}
            <span className="linetext">{line || '\u00A0'}</span>
          </div>
        );
      })}
    </div>
  );
}

function calculateDialogPosition(
  markerElement: Element,
  dialogHeight: number
): DialogPosition {
  const markerRect = markerElement.getBoundingClientRect();
  const markerCenterY = markerRect.top + markerRect.height / 2;
  const spaceRight = window.innerWidth - markerRect.right - 16;

  const side: 'left' | 'right' = spaceRight >= 240 ? 'right' : 'left';
  const maxWidth =
    side === 'right'
      ? Math.min(300, Math.max(180, Math.floor(spaceRight - 10)))
      : Math.min(300, Math.max(180, Math.floor(markerRect.left - 24)));

  const minTop = 66;
  const maxTop = Math.max(minTop, window.innerHeight - dialogHeight - 16);
  const idealTop = markerCenterY - Math.min(dialogHeight / 2, 24);
  const top = Math.round(Math.min(Math.max(minTop, idealTop), maxTop));
  const arrowTop = Math.round(
    Math.min(
      Math.max(8, markerCenterY - top - 8),
      Math.max(8, dialogHeight - 24)
    )
  );

  return {
    top,
    left: side === 'right' ? Math.round(markerRect.right + 10) : undefined,
    right:
      side === 'left'
        ? Math.round(window.innerWidth - markerRect.left + 10)
        : undefined,
    maxWidth,
    side,
    arrowTop,
  };
}

function SideNotes({
  chapterHeight,
  notes,
  activeNoteId,
  onSelectNote,
}: SideNotesProps): JSX.Element {
  const usableHeight = Math.max(0, chapterHeight - 16);

  return (
    <aside className="sidenotes" aria-label="Marginal glosses">
      {notes.map((note, index) => {
        const topPixels = Math.round((usableHeight * note.position) / 100);
        const isActive = note.id === activeNoteId;
        return (
          <button
            key={note.id}
            type="button"
            data-note-id={note.id}
            className={`sidenotebutton ${isActive ? 'is-active' : ''}`}
            style={{ top: `${topPixels}px` }}
            aria-label={`Marginal note ${index + 1}`}
            aria-expanded={isActive}
            onClick={() => onSelectNote(note)}
          />
        );
      })}
    </aside>
  );
}

function Dialog({ note, onClose }: DialogProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dialogPosition, setDialogPosition] = useState<DialogPosition>(
    INITIAL_DIALOG_POSITION
  );

  useOutsideClick([wrapperRef], onClose, true, '.sidenotebutton');

  useEffect(() => {
    function updatePosition(): void {
      const markerElement = document.querySelector(
        `[data-note-id="${note.id}"]`
      );
      if (!markerElement) {
        return;
      }
      const dialogHeight = wrapperRef.current?.offsetHeight || 64;
      setDialogPosition(calculateDialogPosition(markerElement, dialogHeight));
    }

    updatePosition();
    const animationFrameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [note.id, note.text]);

  return (
    <div
      ref={wrapperRef}
      className={`dialogcontainer dialog-${dialogPosition.side}`}
      style={{
        top: `${dialogPosition.top}px`,
        left:
          dialogPosition.left !== undefined
            ? `${dialogPosition.left}px`
            : undefined,
        right:
          dialogPosition.right !== undefined
            ? `${dialogPosition.right}px`
            : undefined,
        maxWidth: `${dialogPosition.maxWidth}px`,
      }}
      role="dialog"
      aria-label="Marginal gloss"
    >
      {dialogPosition.side === 'right' && (
        <div
          className="dialogtriangle dialogtriangle-left"
          style={{ marginTop: `${dialogPosition.arrowTop}px` }}
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
      {dialogPosition.side === 'left' && (
        <div
          className="dialogtriangle dialogtriangle-right"
          style={{ marginTop: `${dialogPosition.arrowTop}px` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function MainText({
  versionId,
  compareVersionId,
  versions,
  chapterNumber,
  chapters,
  readingPreferences,
  onVersionChange,
  onCompareVersionChange,
}: MainTextProps): JSX.Element {
  const [primaryData, setPrimaryData] = useState<ChapterPayload | null>(null);
  const [compareData, setCompareData] = useState<ChapterPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [activeNote, setActiveNote] = useState<SideNote | null>(null);

  const primaryTextRef = useRef<HTMLDivElement>(null);
  const chapterMetadata = chapters.find(
    (item) => item.number === chapterNumber
  );

  useEffect(() => {
    const abortController = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);
    setActiveNote(null);

    const primaryRequest = fetchChapterPayload(
      versionId,
      chapterNumber,
      abortController.signal,
      'chapter'
    );
    const compareRequest = compareVersionId
      ? fetchChapterPayload(
          compareVersionId,
          chapterNumber,
          abortController.signal,
          'comparison text'
        )
      : Promise.resolve<ChapterPayload | null>(null);

    Promise.all([primaryRequest, compareRequest])
      .then(([loadedPrimary, loadedCompare]) => {
        setPrimaryData(loadedPrimary);
        setCompareData(loadedCompare);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Unable to load chapter.';
        setErrorMessage(message);
        setIsLoading(false);
      });

    return () => abortController.abort();
  }, [versionId, compareVersionId, chapterNumber, retryCounter]);

  useEffect(() => {
    const textElement = primaryTextRef.current;
    if (!textElement) {
      return undefined;
    }

    function measureHeight(): void {
      if (!textElement) {
        return;
      }
      setTextHeight(textElement.offsetHeight || textElement.scrollHeight || 0);
    }

    measureHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(measureHeight);
      resizeObserver.observe(textElement);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', measureHeight, { passive: true });
    return () => window.removeEventListener('resize', measureHeight);
  }, [
    primaryData,
    readingPreferences.fontSize,
    readingPreferences.showLineNumbers,
    compareVersionId,
  ]);

  const handleSelectNote = useCallback((note: SideNote) => {
    setActiveNote((previous) =>
      previous && previous.id === note.id ? null : note
    );
  }, []);

  const sideNotes = primaryData?.sidenotes || [];

  return (
    <main
      className={`maincontainer font-${readingPreferences.fontSize} ${
        compareVersionId ? 'maincontainer-compare' : ''
      }`}
      id="maincontainer"
    >
      <div className="readingframe">
        <div className="knotcolumn" aria-hidden="true" />

        <div className="readingarea">
          <ChapterTitle
            chapterNumber={chapterNumber}
            romanNumeral={primaryData?.roman || chapterMetadata?.roman}
            title={primaryData?.title || chapterMetadata?.title}
          />

          {errorMessage && (
            <div className="error-banner" role="alert">
              <span>{errorMessage}</span>
              <button
                type="button"
                className="retry-btn"
                onClick={() => setRetryCounter((count) => count + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {!primaryData && isLoading && (
            <div className="loading-placeholder" aria-live="polite">
              Loading fitt…
            </div>
          )}

          {primaryData && !compareVersionId && (
            <div className="singlecolumn-layout">
              <div
                ref={primaryTextRef}
                id="text"
                className={`textsurface ${isLoading ? 'is-loading' : ''}`}
              >
                {renderTextContent(
                  primaryData,
                  readingPreferences.showLineNumbers
                )}
              </div>

              {readingPreferences.showSideNotes && sideNotes.length > 0 && (
                <SideNotes
                  chapterHeight={textHeight}
                  notes={sideNotes}
                  activeNoteId={activeNote?.id || null}
                  onSelectNote={handleSelectNote}
                />
              )}
            </div>
          )}

          {primaryData && compareVersionId && (
            <>
              <div className={`compare-grid ${isLoading ? 'is-loading' : ''}`}>
                <section
                  className="compare-pane"
                  aria-label="Primary translation pane"
                >
                  <div className="compare-pane-header">
                    <select
                      aria-label="Primary translation"
                      className="compare-select"
                      value={versionId}
                      onChange={(event) => onVersionChange(event.target.value)}
                    >
                      {versions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="textsurface">
                    {renderTextContent(
                      primaryData,
                      readingPreferences.showLineNumbers
                    )}
                  </div>
                </section>

                <section
                  className="compare-pane"
                  aria-label="Comparison translation pane"
                >
                  <div className="compare-pane-header">
                    <select
                      aria-label="Comparison translation"
                      className="compare-select"
                      value={compareVersionId}
                      onChange={(event) =>
                        onCompareVersionChange(event.target.value)
                      }
                    >
                      {versions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="textsurface">
                    {compareData ? (
                      renderTextContent(
                        compareData,
                        readingPreferences.showLineNumbers
                      )
                    ) : (
                      <div className="loading-placeholder">
                        Loading comparison…
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {readingPreferences.showSideNotes && sideNotes.length > 0 && (
                <details className="compare-notes">
                  <summary>Marginal Glosses ({sideNotes.length})</summary>
                  <ul className="compare-notes-list">
                    {sideNotes.map((note) => (
                      <li key={note.id}>{note.text}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      </div>

      {activeNote && !compareVersionId && readingPreferences.showSideNotes && (
        <Dialog note={activeNote} onClose={() => setActiveNote(null)} />
      )}
    </main>
  );
}
