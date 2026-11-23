import { useEffect, useRef, useState } from 'react';
import {
  ChapterMetadata,
  FontSize,
  ReadingPreferences,
  VersionMetadata,
} from './types';
import { useOutsideClick } from './useOutsideClick';

const FONT_SIZE_OPTIONS: readonly FontSizeOption[] = [
  { key: 'sm', label: 'A-' },
  { key: 'md', label: 'A' },
  { key: 'lg', label: 'A+' },
];

type OpenMenu = 'chapters' | 'versions' | null;

interface FontSizeOption {
  key: FontSize;
  label: string;
}

export interface TopBarProps {
  versionId: string;
  compareVersionId: string | null;
  versions: VersionMetadata[];
  chapters: ChapterMetadata[];
  chapterNumber: number;
  totalChapters: number;
  readingPreferences: ReadingPreferences;
  onUpdatePreference: <K extends keyof ReadingPreferences>(
    key: K,
    value: ReadingPreferences[K]
  ) => void;
  onVersionChange: (nextVersionId: string) => void;
  onChapterChange: (nextChapter: number) => void;
  onToggleCompare: () => void;
}

export function TopBar({
  versionId,
  compareVersionId,
  versions,
  chapters,
  chapterNumber,
  totalChapters,
  readingPreferences,
  onUpdatePreference,
  onVersionChange,
  onChapterChange,
  onToggleCompare,
}: TopBarProps): JSX.Element {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [chapterQuery, setChapterQuery] = useState('');

  const chaptersMenuRef = useRef<HTMLDivElement>(null);
  const versionsMenuRef = useRef<HTMLDivElement>(null);
  const optionsPanelRef = useRef<HTMLElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const activeChapterItemRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(
    [chaptersMenuRef],
    () => setOpenMenu(null),
    openMenu === 'chapters'
  );
  useOutsideClick(
    [versionsMenuRef],
    () => setOpenMenu(null),
    openMenu === 'versions'
  );
  useOutsideClick(
    [optionsPanelRef, optionsButtonRef],
    () => setShowOptions(false),
    showOptions
  );

  const activeChapterMetadata = chapters.find(
    (item) => item.number === chapterNumber
  );
  const activeVersionMetadata = versions.find((item) => item.id === versionId);

  useEffect(() => {
    if (openMenu === 'chapters') {
      setChapterQuery('');
      activeChapterItemRef.current?.scrollIntoView?.({ block: 'nearest' });
      filterInputRef.current?.focus?.();
    }
  }, [openMenu]);

  const normalizedQuery = chapterQuery.trim().toLowerCase();
  const filteredChapters = chapters.filter((item) => {
    if (!normalizedQuery) {
      return true;
    }
    return (
      String(item.number) === normalizedQuery ||
      item.roman.toLowerCase().includes(normalizedQuery) ||
      item.title.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <>
      <header className="topcontainer">
        <div className="topbar">
          <div className="brandgroup">
            <button
              type="button"
              className="maintitlebtn"
              onClick={() => onChapterChange(1)}
              title="Return to Chapter I"
            >
              BEOWULF
            </button>
            <span className="maintitleline" aria-hidden="true" />
            {activeChapterMetadata && (
              <span
                className="topbar-chapter-crumb"
                title={activeChapterMetadata.title}
              >
                {activeChapterMetadata.roman}. {activeChapterMetadata.title}
              </span>
            )}
          </div>

          <nav className="topcontrols" aria-label="Reader controls">
            <div ref={chaptersMenuRef} className="dropdownwrapper">
              <button
                type="button"
                className={`dropdownbtn ${openMenu === 'chapters' ? 'is-open' : ''}`}
                aria-expanded={openMenu === 'chapters'}
                aria-controls="chapters-menu"
                onClick={() => {
                  setShowOptions(false);
                  setOpenMenu((previous) =>
                    previous === 'chapters' ? null : 'chapters'
                  );
                }}
              >
                <span>
                  Ch.{' '}
                  {activeChapterMetadata
                    ? activeChapterMetadata.roman
                    : chapterNumber}
                </span>
                <span
                  className={`caret ${openMenu === 'chapters' ? 'caret-open' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {openMenu === 'chapters' && (
                <div
                  id="chapters-menu"
                  className="dropdownpanel chapters-panel"
                  role="menu"
                >
                  <div
                    className="dropdown-search-wrap"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      ref={filterInputRef}
                      type="search"
                      className="dropdown-search"
                      placeholder={`Filter 1–${totalChapters} or title…`}
                      value={chapterQuery}
                      onChange={(event) => setChapterQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          filteredChapters.length > 0
                        ) {
                          onChapterChange(filteredChapters[0].number);
                          setOpenMenu(null);
                        }
                      }}
                      aria-label="Filter chapters"
                    />
                  </div>
                  <div className="dropdown-list">
                    {filteredChapters.length === 0 ? (
                      <div className="dropdown-empty">No matching chapters</div>
                    ) : (
                      filteredChapters.map((item) => {
                        const isActive = item.number === chapterNumber;
                        return (
                          <button
                            key={item.number}
                            ref={isActive ? activeChapterItemRef : null}
                            type="button"
                            role="menuitem"
                            className={`dropdown-item chapter-item ${
                              isActive ? 'is-active' : ''
                            }`}
                            onClick={() => {
                              onChapterChange(item.number);
                              setOpenMenu(null);
                            }}
                          >
                            <span className="item-roman">{item.roman}.</span>
                            <span className="item-title">{item.title}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={versionsMenuRef} className="dropdownwrapper">
              <button
                type="button"
                className={`dropdownbtn ${openMenu === 'versions' ? 'is-open' : ''}`}
                aria-expanded={openMenu === 'versions'}
                aria-controls="versions-menu"
                onClick={() => {
                  setShowOptions(false);
                  setOpenMenu((previous) =>
                    previous === 'versions' ? null : 'versions'
                  );
                }}
              >
                <span>
                  {activeVersionMetadata
                    ? activeVersionMetadata.shortName
                    : 'Translation'}
                </span>
                <span
                  className={`caret ${openMenu === 'versions' ? 'caret-open' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {openMenu === 'versions' && (
                <div
                  id="versions-menu"
                  className="dropdownpanel versions-panel"
                  role="menu"
                >
                  <div className="dropdown-list">
                    {versions.map((item) => {
                      const isActive = item.id === versionId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          className={`dropdown-item version-item ${
                            isActive ? 'is-active' : ''
                          }`}
                          onClick={() => {
                            onVersionChange(item.id);
                            setOpenMenu(null);
                          }}
                        >
                          <div className="version-item-top">
                            <span className="version-item-name">
                              {item.name}
                            </span>
                            <span className="form-badge">{item.form}</span>
                          </div>
                          <div className="version-item-meta">
                            {item.translator} · {item.year}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`comparebtn ${compareVersionId ? 'is-active' : ''}`}
              aria-pressed={Boolean(compareVersionId)}
              onClick={() => {
                setOpenMenu(null);
                onToggleCompare();
              }}
              title="Compare two translations side by side"
            >
              {compareVersionId ? 'Exit Compare' : 'Compare'}
            </button>

            <button
              ref={optionsButtonRef}
              type="button"
              className="hamburgercontainer"
              aria-label="Reader settings and sources"
              aria-expanded={showOptions}
              onClick={() => {
                setOpenMenu(null);
                setShowOptions((previous) => !previous);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                className="hamburger"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {showOptions && (
        <aside
          ref={optionsPanelRef}
          className="optionscontainer"
          aria-label="Reader settings and sources"
        >
          <div className="options-header">
            <h2 className="options-title">Settings & Sources</h2>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setShowOptions(false)}
              aria-label="Close settings panel"
            >
              <svg
                viewBox="0 0 14 14"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path
                  d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="options">
            <section className="options-section">
              <h3 className="options-subtitle">Reading Preferences</h3>

              <div className="pref-row">
                <span className="pref-label">Text Size</span>
                <div
                  className="fontsize-group"
                  role="group"
                  aria-label="Text size"
                >
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`fontsize-btn ${
                        readingPreferences.fontSize === option.key
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => onUpdatePreference('fontSize', option.key)}
                      aria-pressed={readingPreferences.fontSize === option.key}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={readingPreferences.showLineNumbers}
                  onChange={(event) =>
                    onUpdatePreference('showLineNumbers', event.target.checked)
                  }
                />
                <span>Show verse line numbers</span>
              </label>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={readingPreferences.showSideNotes}
                  onChange={(event) =>
                    onUpdatePreference('showSideNotes', event.target.checked)
                  }
                />
                <span>Show marginal glosses</span>
              </label>
            </section>

            <section className="options-section">
              <h3 className="options-subtitle">About</h3>
              <p className="optionstext">
                Designed and built by{' '}
                <a
                  href="https://www.jakeroseman.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Jake Roseman
                </a>
                . Source code on{' '}
                <a
                  href="https://github.com/rosemanjake/beowulf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                .
              </p>
              <a
                className="donatebutton"
                href="https://www.paypal.com/donate/?hosted_button_id=TNN9K9X56KVPQ"
                target="_blank"
                rel="noopener noreferrer"
              >
                Donate
              </a>
            </section>

            <section className="options-section">
              <h3 className="options-subtitle">Editions & Licenses</h3>
              <p className="optionstext">
                All texts are in the public domain or openly licensed (CC BY
                4.0):
              </p>
              <ul className="sources-list">
                {versions.map((item) => (
                  <li key={item.id} className="source-entry">
                    <div className="source-entry-head">
                      <strong>{item.name}</strong>
                      <span className="license-badge">{item.license}</span>
                    </div>
                    <div className="source-entry-desc">{item.description}</div>
                    <div className="source-entry-links">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.sourceLabel}
                      </a>
                      {item.license === 'CC BY 4.0' && (
                        <>
                          {' · '}
                          <a
                            href={item.licenseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            License
                          </a>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}
