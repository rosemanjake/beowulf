import React, { memo } from 'react';

function BottomBar({ chapter, totalChapters, chapters, onChapterChange }) {
  const prevChapter = chapter > 1 ? chapters.find((c) => c.number === chapter - 1) : null;
  const nextChapter = chapter < totalChapters ? chapters.find((c) => c.number === chapter + 1) : null;

  return (
    <footer className="bottomcontainer">
      <nav className="bottombar" aria-label="Chapter navigation">
        <button
          type="button"
          className="bottomnav-btn bottomnav-prev"
          onClick={() => prevChapter && onChapterChange(prevChapter.number)}
          disabled={!prevChapter}
          aria-label="Previous chapter"
        >
          <span className="bottomnav-dir">← Previous</span>
          {prevChapter && (
            <span className="bottomnav-sub">
              {prevChapter.roman}. {prevChapter.title}
            </span>
          )}
        </button>

        <div className="bottomnav-center">
          <div className="chapterindicator">
            <span className="activechapter">{chapter}</span>
            <span> / {totalChapters}</span>
          </div>
        </div>

        <button
          type="button"
          className="bottomnav-btn bottomnav-next"
          onClick={() => nextChapter && onChapterChange(nextChapter.number)}
          disabled={!nextChapter}
          aria-label="Next chapter"
        >
          <span className="bottomnav-dir">Next →</span>
          {nextChapter && (
            <span className="bottomnav-sub">
              {nextChapter.roman}. {nextChapter.title}
            </span>
          )}
        </button>
      </nav>

      <div className="copyright">
        <span>© Jake Roseman · </span>
        <a href="https://www.jakeroseman.com" target="_blank" rel="noopener noreferrer">
          jakeroseman.com
        </a>
        <span> · </span>
        <a
          href="https://github.com/rosemanjake/beowulf"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default memo(BottomBar);
