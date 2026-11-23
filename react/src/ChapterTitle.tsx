export interface ChapterTitleProps {
  chapterNumber: number;
  romanNumeral?: string;
  title?: string;
}

export function ChapterTitle({
  chapterNumber,
  romanNumeral,
  title,
}: ChapterTitleProps): JSX.Element {
  const heading =
    romanNumeral && title
      ? `${romanNumeral}. ${title}`
      : title || `Chapter ${chapterNumber}`;

  return (
    <div className="chapterheader">
      <h1 className="chapterheading">{heading}</h1>
      <div className="titleline" aria-hidden="true" />
    </div>
  );
}
