import { memo } from 'react';

function ChapterTitle({ chapter, roman, title }) {
  const heading = roman && title ? `${roman}. ${title}` : title || `Chapter ${chapter}`;

  return (
    <div className="chapterheader">
      <h1 className="chapterheading">{heading}</h1>
      <div className="titleline" aria-hidden="true" />
    </div>
  );
}

export default memo(ChapterTitle);
