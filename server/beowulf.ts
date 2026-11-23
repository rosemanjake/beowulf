import fs from 'fs';
import { JSDOM } from 'jsdom';

const ROMAN_DIGIT_TABLE: readonly string[] = [
  '',
  'C',
  'CC',
  'CCC',
  'CD',
  'D',
  'DC',
  'DCC',
  'DCCC',
  'CM',
  '',
  'X',
  'XX',
  'XXX',
  'XL',
  'L',
  'LX',
  'LXX',
  'LXXX',
  'XC',
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
];

export interface SideNote {
  id: string;
  position: number;
  lineIndex: number;
  text: string;
}

export interface ParsedLine {
  text: string;
  sideNote: string;
}

export interface ParsedChapter {
  number: number;
  roman: string;
  title: string;
  text: string;
  lineCount: number;
  sideNotes: SideNote[];
}

export interface ParsedBeowulfHtml {
  chapters: ParsedChapter[];
  chapterTitleMap: Record<number, string>;
  sideNotesByChapter: Record<number, SideNote[]>;
  legacySideNotesByChapter: Record<number, Record<number, string>>;
}

export function toRomanNumeral(value: number): string {
  if (!Number.isInteger(value) || value <= 0) {
    return '';
  }
  const digits = String(value).split('');
  let roman = '';
  let place = 3;
  while (place--) {
    const popped = digits.pop();
    const digitIndex = popped !== undefined ? Number(popped) + place * 10 : -1;
    roman = (ROMAN_DIGIT_TABLE[digitIndex] || '') + roman;
  }
  return Array(Number(digits.join('')) + 1).join('M') + roman;
}

export function parseLesslieHallHtml(filePath: string): ParsedBeowulfHtml {
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  const document = new JSDOM(htmlContent).window.document;
  const mainContainer = document.getElementById('MAIN');
  if (!mainContainer) {
    throw new Error('Could not find #MAIN container in beo.html');
  }

  const chapterElements = Array.from(
    mainContainer.getElementsByClassName('fit')
  );
  const chapters: ParsedChapter[] = [];
  const chapterTitleMap: Record<number, string> = {};
  const sideNotesByChapter: Record<number, SideNote[]> = {};
  const legacySideNotesByChapter: Record<number, Record<number, string>> = {};

  chapterElements.forEach((chapterElement, index) => {
    const chapterNumber = index + 1;
    const roman = toRomanNumeral(chapterNumber);
    const title = extractChapterTitle(chapterElement);
    const lines = extractChapterLines(chapterElement);
    const sideNotes = buildSideNotes(chapterNumber, lines);

    chapters.push({
      number: chapterNumber,
      roman,
      title,
      text: lines.map((line) => line.text).join('\n'),
      lineCount: lines.length,
      sideNotes,
    });
    chapterTitleMap[chapterNumber] = title;
    sideNotesByChapter[chapterNumber] = sideNotes;
    legacySideNotesByChapter[chapterNumber] = buildLegacySideNoteMap(sideNotes);
  });

  return {
    chapters,
    chapterTitleMap,
    sideNotesByChapter,
    legacySideNotesByChapter,
  };
}

function extractChapterTitle(chapterElement: Element): string {
  const headingElement =
    chapterElement.querySelector('h2:not(.num)') ||
    chapterElement.querySelector('h2');
  return headingElement
    ? headingElement.textContent?.replace(/\s+/g, ' ').trim() || ''
    : '';
}

function extractChapterLines(chapterElement: Element): ParsedLine[] {
  const parsedLines: ParsedLine[] = [];
  const children = chapterElement.children;

  for (let childIndex = 0; childIndex < children.length; childIndex++) {
    const currentElement = children[childIndex];
    if (!currentElement.classList.contains('l')) {
      continue;
    }

    let sideNote = '';
    if (childIndex > 0) {
      const previousElement = children[childIndex - 1];
      if (previousElement.classList.contains('sidenote')) {
        sideNote =
          previousElement.textContent?.replace(/\s+/g, ' ').trim() || '';
      }
    }

    const clonedElement = currentElement.cloneNode(true) as Element;
    clonedElement
      .querySelectorAll('sup.footnoteref')
      .forEach((footnoteRef) => footnoteRef.remove());
    const cleanText =
      clonedElement.textContent?.replace(/\s+/g, ' ').trim() || '';

    parsedLines.push({ text: cleanText, sideNote });
  }

  return parsedLines;
}

function buildSideNotes(
  chapterNumber: number,
  lines: ParsedLine[]
): SideNote[] {
  const sideNotes: SideNote[] = [];
  const lineSpan = lines.length > 1 ? lines.length - 1 : 1;

  lines.forEach((line, lineIndex) => {
    if (!line.sideNote) {
      return;
    }
    const position =
      lines.length <= 1 ? 0 : Number(((lineIndex / lineSpan) * 100).toFixed(4));
    sideNotes.push({
      id: `${chapterNumber}-${lineIndex}`,
      position,
      lineIndex,
      text: line.sideNote,
    });
  });

  return sideNotes;
}

function buildLegacySideNoteMap(sideNotes: SideNote[]): Record<number, string> {
  const legacyMap: Record<number, string> = {};
  for (const note of sideNotes) {
    let key = note.position;
    while (Object.prototype.hasOwnProperty.call(legacyMap, key)) {
      key = Number((key + 0.001).toFixed(4));
    }
    legacyMap[key] = note.text;
  }
  return legacyMap;
}
