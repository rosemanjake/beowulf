const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {
    readSimpleText: function (path, prose, linerange) {
        return new SimpleText(path, prose, linerange)
    },
}

let currlineno = 1

class SimpleText{
    constructor(path, prose, linerange){
        this.text = String(fs.readFileSync(path))
        this.chapters = getSimpleChapters(this.text, prose, linerange)
        this.prose = prose
        //this.linemap = getSimpleLineMap(this.lines)
    }
}

class SimpleChapter{
    constructor(text){
        this.text = text
        this.lines = getSimpleLines(text)
    }
}

class SimpleLine{
    constructor(lineno, linetext, splitplace){
        this.lineno = lineno
        this.linetext = linetext
        this.splitplace = splitplace // Char at which there is a line division into 2
    }
}

function getSimpleChapters(text, prose, linerange){
    let final = []
    let split
    if (prose){
        split = text.split(/\<p\>/)
    }
    else{
        split = []
        for (let currchap = 1; currchap <= 43; currchap++){
            split.push(getChapterSplit(text, linerange, currchap))
        }     
    }
    split = split.filter(chap => !chap.match(/^\s*$/))
    split = split.map(chap => chap.replace(/^[\r\n]*|[\r\n]*$/, ""))

    split.forEach(chapter => {
        final.push(new SimpleChapter(chapter))
    })

    return final
}


function getChapterSplit(text, linerange, currchap){
    let currlinerange = linerange[currchap] 
    return getLines(currlinerange[0], currlinerange[1], text)
}

function getLines(startindex, endindex, text){
    lines = text.split("\n")
    lines = lines.slice(startindex - 1, endindex)
    return lines.join("\n")
}

function getSimpleLines(text){
    let finallines = []
    let simplelines = text.split("\n")

    for (let i = 0; i < simplelines.length; i++){
        finallines.push(new SimpleLine(currlineno, simplelines[i], -1))
        currlineno++
    }

    return finallines
}

function getSimpleLineMap(lines){
    let linemap = {}
    lines.forEach((line, i) => {
        linemap[i+1] = line.linetext
    })
    return linemap
}