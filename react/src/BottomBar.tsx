import { ChapterMetadata } from './types';

export interface BottomBarProps {
  chapterNumber: number;
  totalChapters: number;
  chapters: ChapterMetadata[];
  onChapterChange: (nextChapter: number) => void;
}

export function BottomBar({
  chapterNumber,
  totalChapters,
  chapters,
  onChapterChange,
}: BottomBarProps): JSX.Element {
  const previousChapter =
    chapterNumber > 1
      ? chapters.find((item) => item.number === chapterNumber - 1) || null
      : null;
  const nextChapter =
    chapterNumber < totalChapters
      ? chapters.find((item) => item.number === chapterNumber + 1) || null
      : null;

  return (
    <footer className="bottomcontainer">
      <nav className="bottombar" aria-label="Chapter navigation">
        <button
          type="button"
          className="bottomnav-btn bottomnav-prev"
          onClick={() =>
            previousChapter && onChapterChange(previousChapter.number)
          }
          disabled={!previousChapter}
          aria-label="Previous chapter"
        >
          <span className="bottomnav-dir">← Previous</span>
          {previousChapter && (
            <span className="bottomnav-sub">
              {previousChapter.roman}. {previousChapter.title}
            </span>
          )}
        </button>

        <div className="bottomnav-center">
          <div className="chapterindicator">
            <span className="activechapter">{chapterNumber}</span>
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
        <a
          href="https://www.jakeroseman.com"
          target="_blank"
          rel="noopener noreferrer"
        >
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
