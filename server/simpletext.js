const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {
    readSimpleText: function (path) {
        return new SimpleText(path)
    },
}

let currlineno = 1

class SimpleText{
    constructor(path){
        this.text = String(fs.readFileSync(path))
        this.chapters = getSimpleChapters(this.text)
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

function getSimpleChapters(text){
    let final = []
    let split = text.split(/\n\n|\r\n\r\n/)

    split.forEach(chapter => {
        final.push(new SimpleChapter(chapter))
    })

    return final
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