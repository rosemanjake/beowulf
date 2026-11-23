import fs from 'fs';
import { LineRange } from './lineRanges.js';

export interface ReadChaptersOptions {
  delimited: boolean;
  lineRanges?: Record<number, LineRange>;
}

export function readChaptersFromFile(
  filePath: string,
  options: ReadChaptersOptions
): string[] {
  const normalizedText = fs
    .readFileSync(filePath, 'utf8')
    .replace(/\r\n/g, '\n');

  let rawChapters: string[];
  if (options.delimited) {
    rawChapters = normalizedText.split(/<p>/);
  } else {
    if (!options.lineRanges) {
      throw new Error('lineRanges is required for non-delimited texts');
    }
    const totalChapters = Object.keys(options.lineRanges).length;
    const allLines = normalizedText.split('\n');
    rawChapters = [];
    for (
      let chapterNumber = 1;
      chapterNumber <= totalChapters;
      chapterNumber++
    ) {
      const { startLine, endLine } = options.lineRanges[chapterNumber];
      rawChapters.push(allLines.slice(startLine - 1, endLine).join('\n'));
    }
  }

  return rawChapters
    .filter((chapterText) => !/^\s*$/.test(chapterText))
    .map((chapterText) => chapterText.replace(/^\n+|\n+$/g, ''));
}
