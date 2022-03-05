const fs = require('fs');
const path = require('path');

module.exports = {
    readGumere: function (path) {
        return new Gumere(path)
    },
}

class Gumere{
    constructor(path){
        this.text = String(fs.readFileSync(path))
        this.chapters = getGChapters(this.text)
        this.linemap = getGLineMap(this.chapters)
        this.linerange = getGLineRange(this.chapters, this.linemap)
    }
}

class GChapter{
    constructor(chapterstr){
        this.lines = chapterstr.split("\n").filter(chap => !chap.match(/^\s*$/))
    }
}

function getGChapters(text){
    let fullchaps = []
    let simplechaps = text.split("<p>").filter(chap => !chap.match(/^\s*$/))

    simplechaps.forEach(chapter => {
        fullchaps.push(new GChapter(chapter))
    })

    return fullchaps
}

function getGLineMap(chapters){
    let linemap = {}


    let lineno = 1
    chapters.forEach((chapter) => {
        chapter.lines.forEach(line => {
            linemap[lineno] = line
            lineno++
        })
    })

    return linemap
}

// Returns map where:
// key = chapter number (starting from 1)
// value[0] == index of first line in chapter (starting from 1)
// value[1] == index of last line in chapter (starting from 1)
function getGLineRange(chapters, linemap){
    let linenos = Array.from(Object.keys(linemap))
    let linetexts = Array.from(Object.values(linemap))
    let reversemap = {}
    linetexts.forEach((linetext, i) => {
        reversemap[linetext] = linenos[i]
    })

    let linerange = {}

    chapters.forEach((chapter, i) => {
        let firstline = chapter.lines[0]
        let lastline = chapter.lines[chapter.lines.length - 1]

        let firstindex = reversemap[firstline]
        let lastindex = reversemap[lastline]

        linerange[i+1] = [firstindex, lastindex]
    })

    return linerange
}