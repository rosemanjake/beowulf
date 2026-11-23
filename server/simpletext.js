const fs = require('fs');

function readSimpleText(filePath, optionsOrProse, linerangeArg) {
  let options;
  if (typeof optionsOrProse === 'object' && optionsOrProse !== null) {
    options = optionsOrProse;
  } else {
    // Support legacy positional signature: (filePath, prose, linerange)
    options = {
      prose: Boolean(optionsOrProse),
      delimited: Boolean(optionsOrProse),
      linerange: linerangeArg,
    };
  }
  return new SimpleText(filePath, options);
}

class SimpleText {
  constructor(filePath, { delimited = false, prose = false, linerange = null } = {}) {
    this.text = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    this.prose = Boolean(prose);
    this.delimited = Boolean(delimited);
    this.chapters = getSimpleChapters(this.text, { delimited: this.delimited, linerange });
  }
}

class SimpleChapter {
  constructor(text, startLineNo) {
    this.text = text;
    const result = getSimpleLines(text, startLineNo);
    this.lines = result.lines;
    this.nextLineNo = result.nextLineNo;
  }
}

class SimpleLine {
  constructor(lineno, linetext, splitplace) {
    this.lineno = lineno;
    this.linetext = linetext;
    this.splitplace = splitplace;
  }
}

function getSimpleChapters(text, { delimited, linerange }) {
  let split;

  if (delimited) {
    split = text.split(/<p>/);
  } else {
    if (!linerange) {
      throw new Error('linerange is required when reading non-delimited texts');
    }
    const totalChapters = Object.keys(linerange).length;
    const allLines = text.split('\n');
    split = [];
    for (let currchap = 1; currchap <= totalChapters; currchap++) {
      const [startLine, endLine] = linerange[currchap];
      split.push(allLines.slice(startLine - 1, endLine).join('\n'));
    }
  }

  const cleaned = split
    .filter((chap) => !/^\s*$/.test(chap))
    .map((chap) => chap.replace(/^\n+|\n+$/g, ''));

  const chapters = [];
  let nextLineNo = 1;
  for (const chapterText of cleaned) {
    const chapter = new SimpleChapter(chapterText, nextLineNo);
    nextLineNo = chapter.nextLineNo;
    chapters.push(chapter);
  }

  return chapters;
}

function getSimpleLines(text, startLineNo) {
  const simpleLines = text.split('\n');
  const finalLines = [];
  let currLineNo = startLineNo;

  for (let i = 0; i < simpleLines.length; i++) {
    finalLines.push(new SimpleLine(currLineNo, simpleLines[i], -1));
    currLineNo++;
  }

  return { lines: finalLines, nextLineNo: currLineNo };
}

module.exports = {
  readSimpleText,
};
