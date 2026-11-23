import React, { useState, useEffect, useRef, memo } from 'react';
import useOutsideAlerter from './OutsiderAlerter';

function TopBar({
  version,
  compareVersion,
  versions,
  chapters,
  chapter,
  totalChapters,
  prefs,
  onUpdatePref,
  onVersionChange,
  onChapterChange,
  onToggleCompare,
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'chapters' | 'versions' | null
  const [showOptions, setShowOptions] = useState(false);
  const [chapterQuery, setChapterQuery] = useState('');

  const chaptersMenuRef = useRef(null);
  const versionsMenuRef = useRef(null);
  const optionsRef = useRef(null);
  const hamburgerRef = useRef(null);
  const filterInputRef = useRef(null);
  const activeChapterItemRef = useRef(null);

  useOutsideAlerter([chaptersMenuRef], () => setOpenMenu(null), openMenu === 'chapters');
  useOutsideAlerter([versionsMenuRef], () => setOpenMenu(null), openMenu === 'versions');
  useOutsideAlerter([optionsRef, hamburgerRef], setShowOptions, showOptions);

  const activeChapterMeta = chapters.find((c) => c.number === chapter);
  const activeVersionMeta = versions.find((v) => v.id === version);

  useEffect(() => {
    if (openMenu === 'chapters') {
      setChapterQuery('');
      if (activeChapterItemRef.current?.scrollIntoView) {
        activeChapterItemRef.current.scrollIntoView({ block: 'nearest' });
      }
      if (filterInputRef.current?.focus) {
        filterInputRef.current.focus();
      }
    }
  }, [openMenu]);

  const normalizedQuery = chapterQuery.trim().toLowerCase();
  const filteredChapters = chapters.filter((c) => {
    if (!normalizedQuery) return true;
    return (
      String(c.number) === normalizedQuery ||
      c.roman.toLowerCase().includes(normalizedQuery) ||
      c.title.toLowerCase().includes(normalizedQuery)
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
            {activeChapterMeta && (
              <span className="topbar-chapter-crumb" title={activeChapterMeta.title}>
                {activeChapterMeta.roman}. {activeChapterMeta.title}
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
                  setOpenMenu((prev) => (prev === 'chapters' ? null : 'chapters'));
                }}
              >
                <span>Ch. {activeChapterMeta ? activeChapterMeta.roman : chapter}</span>
                <span className={`caret ${openMenu === 'chapters' ? 'caret-open' : ''}`} aria-hidden="true" />
              </button>

              {openMenu === 'chapters' && (
                <div id="chapters-menu" className="dropdownpanel chapters-panel" role="menu">
                  <div className="dropdown-search-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={filterInputRef}
                      type="search"
                      className="dropdown-search"
                      placeholder={`Filter 1–${totalChapters} or title…`}
                      value={chapterQuery}
                      onChange={(e) => setChapterQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredChapters.length > 0) {
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
                      filteredChapters.map((c) => {
                        const isActive = c.number === chapter;
                        return (
                          <button
                            key={c.number}
                            ref={isActive ? activeChapterItemRef : null}
                            type="button"
                            role="menuitem"
                            className={`dropdown-item chapter-item ${isActive ? 'is-active' : ''}`}
                            onClick={() => {
                              onChapterChange(c.number);
                              setOpenMenu(null);
                            }}
                          >
                            <span className="item-roman">{c.roman}.</span>
                            <span className="item-title">{c.title}</span>
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
                  setOpenMenu((prev) => (prev === 'versions' ? null : 'versions'));
                }}
              >
                <span>{activeVersionMeta ? activeVersionMeta.shortName : 'Translation'}</span>
                <span className={`caret ${openMenu === 'versions' ? 'caret-open' : ''}`} aria-hidden="true" />
              </button>

              {openMenu === 'versions' && (
                <div id="versions-menu" className="dropdownpanel versions-panel" role="menu">
                  <div className="dropdown-list">
                    {versions.map((v) => {
                      const isActive = v.id === version;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          role="menuitem"
                          className={`dropdown-item version-item ${isActive ? 'is-active' : ''}`}
                          onClick={() => {
                            onVersionChange(v.id);
                            setOpenMenu(null);
                          }}
                        >
                          <div className="version-item-top">
                            <span className="version-item-name">{v.name}</span>
                            <span className="form-badge">{v.form}</span>
                          </div>
                          <div className="version-item-meta">
                            {v.translator} · {v.year}
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
              className={`comparebtn ${compareVersion ? 'is-active' : ''}`}
              aria-pressed={Boolean(compareVersion)}
              onClick={() => {
                setOpenMenu(null);
                onToggleCompare();
              }}
              title="Compare two translations side by side"
            >
              {compareVersion ? 'Exit Compare' : 'Compare'}
            </button>

            <button
              ref={hamburgerRef}
              type="button"
              className="hamburgercontainer"
              aria-label="Reader settings and sources"
              aria-expanded={showOptions}
              onClick={() => {
                setOpenMenu(null);
                setShowOptions((prev) => !prev);
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" className="hamburger" aria-hidden="true">
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
          ref={optionsRef}
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
              <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
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
                <div className="fontsize-group" role="group" aria-label="Text size">
                  {[
                    { key: 'sm', label: 'A-' },
                    { key: 'md', label: 'A' },
                    { key: 'lg', label: 'A+' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`fontsize-btn ${prefs.fontSize === opt.key ? 'is-active' : ''}`}
                      onClick={() => onUpdatePref('fontSize', opt.key)}
                      aria-pressed={prefs.fontSize === opt.key}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={prefs.showLineNumbers}
                  onChange={(e) => onUpdatePref('showLineNumbers', e.target.checked)}
                />
                <span>Show verse line numbers</span>
              </label>

              <label className="pref-toggle">
                <input
                  type="checkbox"
                  checked={prefs.showSideNotes}
                  onChange={(e) => onUpdatePref('showSideNotes', e.target.checked)}
                />
                <span>Show marginal glosses</span>
              </label>
            </section>

            <section className="options-section">
              <h3 className="options-subtitle">About</h3>
              <p className="optionstext">
                Designed and built by{' '}
                <a href="https://www.jakeroseman.com" target="_blank" rel="noopener noreferrer">
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
                All texts are in the public domain or openly licensed (CC BY 4.0):
              </p>
              <ul className="sources-list">
                {versions.map((v) => (
                  <li key={v.id} className="source-entry">
                    <div className="source-entry-head">
                      <strong>{v.name}</strong>
                      <span className="license-badge">{v.license}</span>
                    </div>
                    <div className="source-entry-desc">{v.description}</div>
                    <div className="source-entry-links">
                      <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer">
                        {v.sourceLabel}
                      </a>
                      {v.license === 'CC BY 4.0' && (
                        <>
                          {' · '}
                          <a href={v.licenseUrl} target="_blank" rel="noopener noreferrer">
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

export default memo(TopBar);
