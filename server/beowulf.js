const fs = require('fs');
const { JSDOM } = require('jsdom');

function readBeo(filePath) {
  return new Beowulf(filePath);
}

class Beowulf {
  constructor(filePath) {
    this.dom = getDOM(filePath);
    this.document = this.dom.window.document;
    this.chapters = getChapters(this.document);
    this.footnotes = getFootnotes(this.document);
    this.linemap = getLineMap(this.chapters);
    this.sidenotemap = getSideNoteMap(this.chapters);
    this.legacySideNoteMap = getLegacySideNoteMap(this.chapters);
    this.chaptertitles = getChapterTitles(this.chapters);
    this.chaptermap = getChapterMap(this.chaptertitles);
    this.romanchapters = getRomanChapters(this.chapters);
  }
}

class Chapter {
  constructor(DOMchapter, startLine) {
    this.title = getTitle(DOMchapter);
    this.lines = getLines(DOMchapter, startLine);
    this.linerange = getLineRange(this.lines);
    this.text = this.lines.map((l) => l.linetext).join('\n');
  }
}

class Line {
  constructor(lineno, linetext, sidenote, ref, refplace, splitplace) {
    this.lineno = lineno;
    this.linetext = linetext;
    this.sidenote = sidenote;
    this.ref = ref;
    this.refplace = refplace;
    this.splitplace = splitplace;
  }
}

function getDOM(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  return new JSDOM(html);
}

function getChapters(document) {
  const finalChapters = [];
  const main = document.getElementById('MAIN');
  if (!main) {
    throw new Error('Could not find #MAIN container in beo.html');
  }

  const domChapters = Array.from(main.getElementsByClassName('fit'));
  let nextLine = 1;

  for (const domChapter of domChapters) {
    const chapter = new Chapter(domChapter, nextLine);
    finalChapters.push(chapter);
    nextLine += chapter.lines.length;
  }

  return finalChapters;
}

function getTitle(chapter) {
  const heading = chapter.querySelector('h2:not(.num)') || chapter.querySelector('h2');
  return heading ? heading.textContent.replace(/\s+/g, ' ').trim() : '';
}

function getLines(chapter, startLine) {
  const lines = [];
  let currLine = startLine;
  const children = chapter.children;

  for (let i = 0; i < children.length; i++) {
    const currChild = children[i];
    if (!currChild.classList.contains('l')) {
      continue;
    }

    let sidenote = '';
    if (i > 0 && children[i - 1].classList.contains('sidenote')) {
      sidenote = children[i - 1].textContent.replace(/\s+/g, ' ').trim();
    }

    const firstRef = currChild.querySelector('sup.footnoteref');
    const ref = firstRef && firstRef.id ? firstRef.id : '';
    const refplace = firstRef ? currChild.innerHTML.indexOf('<sup') : -1;

    const clone = currChild.cloneNode(true);
    clone.querySelectorAll('sup.footnoteref').forEach((el) => el.remove());
    const linetext = clone.textContent.replace(/\s+/g, ' ').trim();

    lines.push(new Line(currLine, linetext, sidenote, ref, refplace, -1));
    currLine++;
  }

  return lines;
}

function getChapterTitles(chapters) {
  return chapters.map((chapter) => chapter.title);
}

function getSideNoteMap(chapters) {
  const sidenotemap = {};

  chapters.forEach((chapter, i) => {
    const chapno = i + 1;
    const notes = [];
    const span = chapter.lines.length > 1 ? chapter.lines.length - 1 : 1;

    chapter.lines.forEach((line, j) => {
      if (line.sidenote) {
        const position = chapter.lines.length <= 1 ? 0 : Number(((j / span) * 100).toFixed(4));
        notes.push({
          id: `${chapno}-${j}`,
          position,
          lineIndex: j,
          text: line.sidenote,
        });
      }
    });

    sidenotemap[chapno] = notes;
  });

  return sidenotemap;
}

function getLegacySideNoteMap(chapters) {
  const sidenotemap = {};
  const structured = getSideNoteMap(chapters);

  for (const [chapno, notes] of Object.entries(structured)) {
    const map = {};
    for (const note of notes) {
      let key = note.position;
      while (Object.prototype.hasOwnProperty.call(map, key)) {
        key = Number((key + 0.001).toFixed(4));
      }
      map[key] = note.text;
    }
    sidenotemap[chapno] = map;
  }

  return sidenotemap;
}

function getLineMap(chapters) {
  const linemap = {};
  for (const chapter of chapters) {
    for (const line of chapter.lines) {
      linemap[line.lineno] = line.linetext;
    }
  }
  return linemap;
}

function getFootnotes(document) {
  const footnotes = document.getElementsByClassName('footnote');
  const finalFeet = {};
  for (let i = 0; i < footnotes.length; i++) {
    finalFeet[footnotes[i].id] = getFootText(footnotes[i].innerHTML);
  }
  return finalFeet;
}

function getFootText(HTML) {
  let clean = HTML.replace(/<a.*\[\d*\]<\/a>/gms, '');
  clean = clean.replace(/lang="(ang|la)" xml:lang="(ang|la)[\s]*"/gms, '');
  clean = clean.replace(/^[\s]*&nbsp;/, '');
  clean = clean.replace(/[\r\n]*/gms, '');
  return clean;
}

function getLineRange(lines) {
  if (lines.length === 0) return [0, 0];
  return [lines[0].lineno, lines[lines.length - 1].lineno];
}

function romanise(num) {
  if (Number.isNaN(Number(num))) return '';
  const digits = String(+num).split('');
  const key = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX',
  ];
  let roman = '';
  let i = 3;
  while (i--) {
    roman = (key[+digits.pop() + i * 10] || '') + roman;
  }
  return Array(+digits.join('') + 1).join('M') + roman;
}

function getRomanChapters(chapters) {
  return chapters.map((_, i) => romanise(i + 1));
}

function getChapterMap(chaptertitles) {
  const result = {};
  chaptertitles.forEach((title, i) => {
    result[i + 1] = title;
  });
  return result;
}

module.exports = {
  readBeo,
  romanise,
};
