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
function getGLineRange(chapters){
    let linecount = 0
    let linerange = {}

    chapters.forEach((chapter, i) => {
        let firstindex = linecount + 1 
        let lastindex = firstindex + chapter.lines.length - 1

        linerange[i+1] = [firstindex, lastindex]
        linecount = linecount + chapter.lines.length
    })

    return linerange
}