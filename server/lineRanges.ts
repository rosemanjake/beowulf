import fs from 'fs';

export interface LineRange {
  startLine: number;
  endLine: number;
}

export function readChapterLineRanges(
  filePath: string
): Record<number, LineRange> {
  const rawText = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const rawChapters = rawText
    .split('<p>')
    .filter((chapterText) => !/^\s*$/.test(chapterText));

  const lineRanges: Record<number, LineRange> = {};
  let lineCursor = 0;

  rawChapters.forEach((chapterText, index) => {
    const nonEmptyLineCount = chapterText
      .split('\n')
      .filter((line) => !/^\s*$/.test(line)).length;
    const startLine = lineCursor + 1;
    const endLine = startLine + nonEmptyLineCount - 1;
    lineRanges[index + 1] = { startLine, endLine };
    lineCursor += nonEmptyLineCount;
  });

  return lineRanges;
}
