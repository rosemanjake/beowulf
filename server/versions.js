const path = require('path');
const beowulf = require('./beowulf');
const gumere = require('./gumere');
const simpletext = require('./simpletext');

const LIB_DIR = path.join(__dirname, '..', 'library', 'Beowulf');

const beo = beowulf.readBeo(path.join(LIB_DIR, 'beo.html'));
const gumereObj = gumere.readGumere(path.join(LIB_DIR, 'gumere2.html'));
const linerange = gumereObj.linerange;

const texts = {
  as: simpletext.readSimpleText(path.join(LIB_DIR, 'anglosaxon.md'), {
    delimited: false,
    prose: false,
    linerange,
  }),
  hs: simpletext.readSimpleText(path.join(LIB_DIR, 'harrison_sharp.txt'), {
    delimited: true,
    prose: false,
  }),
  hall: beo,
  mw: simpletext.readSimpleText(path.join(LIB_DIR, 'morriswyatt_simple.txt'), {
    delimited: false,
    prose: false,
    linerange,
  }),
  g: simpletext.readSimpleText(path.join(LIB_DIR, 'gumere.html'), {
    delimited: false,
    prose: false,
    linerange,
  }),
  p: simpletext.readSimpleText(path.join(LIB_DIR, 'kirtlan.md'), {
    delimited: true,
    prose: true,
  }),
  sm: simpletext.readSimpleText(path.join(LIB_DIR, 'scott_moncrieff.txt'), {
    delimited: true,
    prose: false,
  }),
  slade: simpletext.readSimpleText(path.join(LIB_DIR, 'slade.txt'), {
    delimited: false,
    prose: false,
    linerange,
  }),
};

const VERSIONS = [
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
    description: 'Scholarly Heyne-Socin Old English text with vowel-length macrons and half-line caesurae.',
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
    description: 'Four-beat alliterative verse translation from the Heyne-Socin edition, source of the marginal glosses.',
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
    description: 'Archaizing Kelmscott Press verse translation rich in Germanic compounds.',
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
    description: 'Classic imitative alliterative verse rendering from The Harvard Classics.',
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
    description: 'Line-for-line alliterative verse translation preserving Old English caesurae (marked with /).',
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
    description: 'Modern scholarly line-by-line English rendering preserving half-line caesurae.',
    sourceLabel: 'Beowulf on Steorarume (heorot.dk)',
    sourceUrl: 'https://heorot.dk/',
  },
];

const VERSION_MAP = Object.fromEntries(VERSIONS.map((v) => [v.id, v]));

const TOTAL_CHAPTERS = beo.chapters.length;

const CHAPTERS = beo.chapters.map((chapter, idx) => {
  const number = idx + 1;
  const [lineStart, lineEnd] = linerange[number] || chapter.linerange;
  return {
    number,
    roman: beo.romanchapters[idx],
    title: chapter.title,
    lineStart,
    lineEnd,
  };
});

function isValidVersion(versionId) {
  return typeof versionId === 'string' && Object.prototype.hasOwnProperty.call(VERSION_MAP, versionId);
}

function parseChapterNumber(rawChapter) {
  const num = Number(rawChapter);
  if (!Number.isInteger(num) || num < 1 || num > TOTAL_CHAPTERS) {
    return null;
  }
  return num;
}

function getMeta() {
  return {
    totalChapters: TOTAL_CHAPTERS,
    versions: VERSIONS,
    chapters: CHAPTERS,
  };
}

function getChapter(versionId, chapterNum) {
  const meta = VERSION_MAP[versionId];
  const dataset = texts[versionId];
  const chapterMeta = CHAPTERS[chapterNum - 1];
  if (!meta || !dataset || !chapterMeta) {
    return null;
  }

  const chapterData = dataset.chapters[chapterNum - 1];
  if (!chapterData) {
    return null;
  }

  return {
    version: meta.id,
    chapter: chapterMeta.number,
    roman: chapterMeta.roman,
    title: chapterMeta.title,
    lineStart: chapterMeta.lineStart,
    lineEnd: chapterMeta.lineEnd,
    isProse: meta.isProse,
    form: meta.form,
    text: chapterData.text,
    sidenotes: beo.sidenotemap[chapterNum] || [],
  };
}

function getLegacyTitles() {
  return beo.chaptermap;
}

function getLegacyChapter(versionId, chapterNum) {
  const data = getChapter(versionId, chapterNum);
  if (!data) {
    return null;
  }
  return [data.text, beo.legacySideNoteMap[chapterNum] || {}];
}

module.exports = {
  VERSIONS,
  CHAPTERS,
  TOTAL_CHAPTERS,
  isValidVersion,
  parseChapterNumber,
  getMeta,
  getChapter,
  getLegacyTitles,
  getLegacyChapter,
};
