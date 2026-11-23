import path from 'path';
import { fileURLToPath } from 'url';
import { parseLesslieHallHtml, SideNote } from './beowulf.js';
import { readChapterLineRanges } from './lineRanges.js';
import { readChaptersFromFile } from './simpleText.js';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const LIBRARY_DIR = path.resolve(CURRENT_DIR, '..', '..', 'library', 'Beowulf');

const LESSLIE_HALL_DATA = parseLesslieHallHtml(
  path.join(LIBRARY_DIR, 'beo.html')
);
const CHAPTER_LINE_RANGES = readChapterLineRanges(
  path.join(LIBRARY_DIR, 'gumere2.html')
);

const CHAPTER_TEXTS_BY_VERSION: Record<string, string[]> = {
  as: readChaptersFromFile(path.join(LIBRARY_DIR, 'anglosaxon.md'), {
    delimited: false,
    lineRanges: CHAPTER_LINE_RANGES,
  }),
  hs: readChaptersFromFile(path.join(LIBRARY_DIR, 'harrison_sharp.txt'), {
    delimited: true,
  }),
  hall: LESSLIE_HALL_DATA.chapters.map((chapter) => chapter.text),
  mw: readChaptersFromFile(path.join(LIBRARY_DIR, 'morriswyatt_simple.txt'), {
    delimited: false,
    lineRanges: CHAPTER_LINE_RANGES,
  }),
  g: readChaptersFromFile(path.join(LIBRARY_DIR, 'gumere.html'), {
    delimited: false,
    lineRanges: CHAPTER_LINE_RANGES,
  }),
  p: readChaptersFromFile(path.join(LIBRARY_DIR, 'kirtlan.md'), {
    delimited: true,
  }),
  sm: readChaptersFromFile(path.join(LIBRARY_DIR, 'scott_moncrieff.txt'), {
    delimited: true,
  }),
  slade: readChaptersFromFile(path.join(LIBRARY_DIR, 'slade.txt'), {
    delimited: false,
    lineRanges: CHAPTER_LINE_RANGES,
  }),
};

export const VERSIONS: readonly VersionMetadata[] = [
  {
    id: 'as',
    name: 'Old English (Original)',
    shortName: 'Old English',
    translator: 'Cotton MS Vitellius A.xv',
    year: 'c. 700–1000',
    form: 'Old English',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description: 'Unnormalized Old English verse without vowel macrons.',
    sourceLabel: 'Old English Edition',
    sourceUrl: 'https://www.gutenberg.org/ebooks/9700',
  },
  {
    id: 'hs',
    name: 'Old English — Macrons (Harrison & Sharp)',
    shortName: 'OE (Macrons)',
    translator: 'James A. Harrison & Robert Sharp',
    year: '1894',
    form: 'Old English',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description:
      'Scholarly Heyne-Socin Old English text with vowel-length macrons and half-line caesurae.',
    sourceLabel: 'Project Gutenberg #9701',
    sourceUrl: 'https://www.gutenberg.org/ebooks/9701',
  },
  {
    id: 'hall',
    name: 'John Lesslie Hall (1892)',
    shortName: 'Lesslie Hall',
    translator: 'John Lesslie Hall',
    year: '1892',
    form: 'Verse',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description:
      'Four-beat alliterative verse translation from the Heyne-Socin edition, source of the marginal glosses.',
    sourceLabel: 'Project Gutenberg #16328',
    sourceUrl: 'https://www.gutenberg.org/ebooks/16328',
  },
  {
    id: 'mw',
    name: 'William Morris & A. J. Wyatt (1895)',
    shortName: 'Morris & Wyatt',
    translator: 'William Morris & A. J. Wyatt',
    year: '1895',
    form: 'Verse',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description:
      'Archaizing Kelmscott Press verse translation rich in Germanic compounds.',
    sourceLabel: 'Project Gutenberg #20431',
    sourceUrl: 'https://www.gutenberg.org/ebooks/20431',
  },
  {
    id: 'g',
    name: 'Francis B. Gummere (1910)',
    shortName: 'Gummere',
    translator: 'Francis Barton Gummere',
    year: '1910',
    form: 'Verse',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description:
      'Classic imitative alliterative verse rendering from The Harvard Classics.',
    sourceLabel: 'Project Gutenberg #981',
    sourceUrl: 'https://www.gutenberg.org/ebooks/981',
  },
  {
    id: 'p',
    name: 'Ernest J. B. Kirtlan (1914)',
    shortName: 'Kirtlan (Prose)',
    translator: 'Ernest J. B. Kirtlan',
    year: '1914',
    form: 'Prose',
    isProse: true,
    license: 'Public Domain',
    licenseUrl: 'https://www.gutenberg.org/policy/license.html',
    description: 'Continuous narrative translation into modern English prose.',
    sourceLabel: 'Project Gutenberg #50742',
    sourceUrl: 'https://www.gutenberg.org/ebooks/50742',
  },
  {
    id: 'sm',
    name: 'C. K. Scott Moncrieff (1921)',
    shortName: 'Scott Moncrieff',
    translator: 'C. K. Scott Moncrieff',
    year: '1921',
    form: 'Verse',
    isProse: false,
    license: 'Public Domain',
    licenseUrl: 'https://archive.org/details/widsithbeowulff00scotuoft',
    description:
      'Line-for-line alliterative verse translation preserving Old English caesurae (marked with /).',
    sourceLabel: 'Internet Archive (1921)',
    sourceUrl: 'https://archive.org/details/widsithbeowulff00scotuoft',
  },
  {
    id: 'slade',
    name: 'Benjamin Slade (2002–2020)',
    shortName: 'Slade (Modern)',
    translator: 'Benjamin Slade',
    year: '2002–2020',
    form: 'Modern English',
    isProse: false,
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    description:
      'Modern scholarly line-by-line English rendering preserving half-line caesurae.',
    sourceLabel: 'Beowulf on Steorarume (heorot.dk)',
    sourceUrl: 'https://heorot.dk/',
  },
];

const VERSION_BY_ID: Record<string, VersionMetadata> = Object.fromEntries(
  VERSIONS.map((versionItem) => [versionItem.id, versionItem])
);

export const TOTAL_CHAPTERS = LESSLIE_HALL_DATA.chapters.length;

export const CHAPTERS: readonly ChapterMetadata[] =
  LESSLIE_HALL_DATA.chapters.map((chapter) => {
    const range = CHAPTER_LINE_RANGES[chapter.number];
    return {
      number: chapter.number,
      roman: chapter.roman,
      title: chapter.title,
      lineStart: range ? range.startLine : 1,
      lineEnd: range ? range.endLine : chapter.lineCount,
    };
  });

export interface VersionMetadata {
  id: string;
  name: string;
  shortName: string;
  translator: string;
  year: string;
  form: string;
  isProse: boolean;
  license: string;
  licenseUrl: string;
  description: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ChapterMetadata {
  number: number;
  roman: string;
  title: string;
  lineStart: number;
  lineEnd: number;
}

export interface ReaderMetadata {
  totalChapters: number;
  versions: readonly VersionMetadata[];
  chapters: readonly ChapterMetadata[];
}

export interface ChapterPayload {
  version: string;
  chapter: number;
  roman: string;
  title: string;
  lineStart: number;
  lineEnd: number;
  isProse: boolean;
  form: string;
  text: string;
  sidenotes: SideNote[];
}

export function isValidVersion(versionId: string): boolean {
  return Object.prototype.hasOwnProperty.call(VERSION_BY_ID, versionId);
}

export function parseChapterNumber(rawChapter: string): number | null {
  const parsedNumber = Number(rawChapter);
  if (
    !Number.isInteger(parsedNumber) ||
    parsedNumber < 1 ||
    parsedNumber > TOTAL_CHAPTERS
  ) {
    return null;
  }
  return parsedNumber;
}

export function getReaderMetadata(): ReaderMetadata {
  return {
    totalChapters: TOTAL_CHAPTERS,
    versions: VERSIONS,
    chapters: CHAPTERS,
  };
}

export function getChapterPayload(
  versionId: string,
  chapterNumber: number
): ChapterPayload | null {
  const versionMeta = VERSION_BY_ID[versionId];
  const versionChapters = CHAPTER_TEXTS_BY_VERSION[versionId];
  const chapterMeta = CHAPTERS[chapterNumber - 1];
  if (!versionMeta || !versionChapters || !chapterMeta) {
    return null;
  }

  const chapterText = versionChapters[chapterNumber - 1];
  if (chapterText === undefined) {
    return null;
  }

  return {
    version: versionMeta.id,
    chapter: chapterMeta.number,
    roman: chapterMeta.roman,
    title: chapterMeta.title,
    lineStart: chapterMeta.lineStart,
    lineEnd: chapterMeta.lineEnd,
    isProse: versionMeta.isProse,
    form: versionMeta.form,
    text: chapterText,
    sidenotes: LESSLIE_HALL_DATA.sideNotesByChapter[chapterNumber] || [],
  };
}

export function getLegacyChapterTitles(): Record<number, string> {
  return LESSLIE_HALL_DATA.chapterTitleMap;
}

export function getLegacyChapterPayload(
  versionId: string,
  chapterNumber: number
): [string, Record<number, string>] | null {
  const payload = getChapterPayload(versionId, chapterNumber);
  if (!payload) {
    return null;
  }
  const legacySideNotes =
    LESSLIE_HALL_DATA.legacySideNotesByChapter[chapterNumber] || {};
  return [payload.text, legacySideNotes];
}
