const fs = require('fs');

function readGumere(filePath) {
  return new Gumere(filePath);
}

class Gumere {
  constructor(filePath) {
    this.text = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    this.chapters = getGChapters(this.text);
    this.linemap = getGLineMap(this.chapters);
    this.linerange = getGLineRange(this.chapters);
  }
}

class GChapter {
  constructor(chapterstr) {
    this.lines = chapterstr.split('\n').filter((line) => !/^\s*$/.test(line));
  }
}

function getGChapters(text) {
  return text
    .split('<p>')
    .filter((chap) => !/^\s*$/.test(chap))
    .map((chap) => new GChapter(chap));
}

function getGLineMap(chapters) {
  const linemap = {};
  let lineno = 1;
  for (const chapter of chapters) {
    for (const line of chapter.lines) {
      linemap[lineno] = line;
      lineno++;
    }
  }
  return linemap;
}

// Returns map where key = chapter number (1-based) and value = [firstLine, lastLine] (1-based).
function getGLineRange(chapters) {
  let linecount = 0;
  const linerange = {};

  chapters.forEach((chapter, i) => {
    const firstindex = linecount + 1;
    const lastindex = firstindex + chapter.lines.length - 1;
    linerange[i + 1] = [firstindex, lastindex];
    linecount += chapter.lines.length;
  });

  return linerange;
}

module.exports = {
  readGumere,
};
