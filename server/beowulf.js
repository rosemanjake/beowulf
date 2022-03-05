const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {
    readBeo: function (path) {
        return new Beowulf(path)
    },
}

let currline = 1

class Beowulf{
    constructor(path){
        this.dom = getDOM(path)
        this.document = this.dom.window.document;
        this.chapters = getChapters(this.document)
        this.footnotes = getFootnotes(this.document)
        this.linemap = getLineMap(this.chapters)
        this.sidenotemap = getSideNoteMap(this.chapters)
    }
}

class Chapter{
    constructor(DOMchapter){
        this.title = `${DOMchapter.id}: ${getTitle(DOMchapter)}`
        this.lines = getLines(DOMchapter)
        this.linerange = getLineRange(this.lines)
    }
}

class Line{
    constructor(lineno, linetext, sidenote, ref, refplace, splitplace){
        this.lineno = lineno
        this.linetext = linetext
        this.sidenote = sidenote
        this.ref = ref // Reference id, e.g. IV.FNREF.1
        this.refplace = refplace // Char at which reference appears in line NOTE: This way we can only have one reference per line
        this.splitplace = splitplace // Char at which there is a line division into 2
    }
}

function getSideNoteMap(chapters){
    let sidenotemap = {}

    chapters.forEach((chapter, i) =>{
        let chapno = i + 1
        let chapternotemap = {}

        chapter.lines.forEach((line, j) =>{

            if (line.sidenote != ""){
                let position = (j / (chapter.linerange[1] - chapter.linerange[0])) * 100
                chapternotemap[position] = line.sidenote
            }
        })

        sidenotemap[chapno] = chapternotemap
    })

    return sidenotemap
}

function getLineMap(chapters){
    let linemap = {}

    chapters.forEach(chapter => {
        chapter.lines.forEach(line =>{
            linemap[line.lineno] = line.linetext
        })
    })

    return linemap
}

function getDOM(path){
    const html = String(fs.readFileSync(path))
    const dom = new JSDOM(html);
    return dom
}

function getChapters(document){
    let finalchapters = []
    
    const main = document.getElementById("MAIN")
    let chapters = main.getElementsByClassName("fit")

    Array.from(chapters).forEach(DOMchapter => {
        finalchapters.push(new Chapter(DOMchapter))
    })

    return finalchapters
}

function getLines(chapter){
    let lines = []

    for(let i = 0; i < chapter.children.length; i++){
        let lineno = currline
        let linetext = ""
        let sidenote = ""
        let ref = ""
        let refplace = -1

        let currchild = chapter.children[i]
        let inner = chapter.children[i].innerHTML

        // Get sidenote, which if it exists will be from the previous div
        if(i > 0){
            let prevchild = chapter.children[i-1]
            if (prevchild.className == "sidenote"){
                sidenote = prevchild.innerHTML.replace(/[\n]+/g, " ")
            }
        }

        // Get main line content + in line reference if applicable
        if (currchild.className == "l"){
            if (currchild.children.length > 0 && currchild.children[0].className == "footnoteref" ){
                ref = currchild.children[0].outerHTML.match(/(?<=id[\s]*=[\s]*").*?(?=")/)[0]
                linetext = inner.replace(/<sup class="footnoteref">.*?<\/sup>/g, "")
                refplace = inner.indexOf("<sup")
            }
            else{
                linetext = inner
            }   
            lines.push(new Line(lineno, linetext, sidenote, ref, refplace))
            currline++
        }
    }

    return lines
}

function getTitle(chapter){
    for(let i = 0; i < chapter.children.length; i++){
        let currchild = chapter.children[i]
        let HTML = chapter.children[i].outerHTML
        if (HTML.match(/<h2>[A-Z\s.,-—’']*/)){
            return currchild.innerHTML
        }
        continue
    }
}

function getFootnotes(document){
    let footnotes = document.getElementsByClassName("footnote")

    let finalfeet = {}
    
    for (let i = 0; i < footnotes.length; i++){
        finalfeet[footnotes[i].id] = getFootText(footnotes[i].innerHTML)
    }

    return finalfeet
}

function getFootText(HTML){
    HTML = HTML.replace(/<a.*\[\d*\]<\/a>/gms, "")
    //HTML = HTML.replace(/<span class="(ang|la)".*?\>/gms, "")
    HTML = HTML.replace(/lang="(ang|la)" xml:lang="(ang|la)[\s]*"/gms, "") 
    HTML = HTML.replace(/^[\s]*&nbsp;/, "")
    HTML = HTML.replace(/[\r\n]*/gms, "")

    return HTML
}


// Returns start lineno and end lineno
function getLineRange(lines){
    return [lines[0].lineno, lines[lines.length - 1].lineno]
}