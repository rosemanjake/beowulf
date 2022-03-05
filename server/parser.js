import { parse } from 'node-html-parser';

const fs = require('fs');
var path = require('path');

module.exports = {
    parse: function () {
        let docpath = path.join(__dirname, '..', 'library')
        return new Library(docpath)
    },
    addDash: function(title){
        return title.replace(/[ ]/gms, "-")
    },
    removeDash: function(title){
        return title.replace(/[-]/gms, " ")
    }      
}

class Library {
    constructor(docpath) {   
        this.sections = getBooks(docpath)
        let [bookmap, vmap] = getMaps(this.sections)
        this.bookmap = bmap 
        this.entrymap = vmap
    }
}

class Book{
    constructor(files, title){
        this.title = title.replace(/^[\d]*_/gms, "")
        this.entries = getVersions(files, this.title)
    }
}

class Version{
    constructor(text, sectiontitle){
        this.title = getTitle(text, sectiontitle)
        this.text = toHTML(text)
    }
}

function getTitle(text, sectiontitle){
    let headpat = text.match(/(?<=^# )[^\r\n]*/)
    let match = text.match(headpat)
    
    if (match){
        return match[0]
    }
    else{
        return sectiontitle.toLowerCase()
    }
}

function getBooks(docpath){
    let sections = []
    let dirs = fs.readdirSync(docpath).filter(function (file) {
        return fs.statSync(`${docpath}/${file}`).isDirectory();
    });

    for (let i = 0; i < dirs.length; i++){
        let dir = dirs[i]
        let currdir = `${docpath}/${dir}`
        let files = fs.readdirSync(currdir, 'utf8').map(file => `${currdir}/${file}`);
        sections.push(new Section(files, dir))
    }

    return sections
}

function getVersions(files, sectiontitle){
    let entries = []

    for (let i = 0; i < files.length; i++){
        let currfile = files[i]
        let text = String(fs.readFileSync(currfile))
        entries.push(new Entry(text, sectiontitle))
    }

    return entries
}


// Flip keys and values in a Map
function inversemap(map){
    let inverse = new Map()
    let keys = Array.from(map.keys())

    keys.forEach((oldkey) => {
        let oldv = map.get(oldkey)
        inverse.set(oldv, oldkey)
    })

    return inverse
}

function getMaps(sections){
    let sectionmap = {}
    let entrymap = {}

    for (let i = 0; i < sections.length; i++){
        let currsection = sections[i]
        let entrylist = []
        for (let j = 0; j < currsection.entries.length; j++){
            let currentry = currsection.entries[j]
            //let dashtitle = addDash(currentry.title)

            entrylist.push(currentry.title)
            entrymap[currentry.title] = currentry
        }
        sectionmap[currsection.title] = entrylist
    }

    return [sectionmap, entrymap]
}

// Takes a map where key = original string and value = replacement. Replace all occurrences of the key in the string with the value.
// In Node v15 it's possible to use replaceAll rather than my findSubstrings() hack. I'm running v14
function mapSwap(map, string){
    let keys = Array.from(map.keys())

    keys.forEach((key) => {
        let substringcount = findSubstrings(string, key).length
        for (let i = 0; i< substringcount; i++){
            string = string.replace(key, map.get(key))
        }       
    })

    return string
}

// Returns array where of all occurrences of substring in string
function findSubstrings(string, substring){
    let substrings = [];
    for (i = 0; i < string.length; ++i) {
        if (string.substring(i, i + substring.length) == substring) {
            substrings.push(i);
        }
    }
    return substrings;
}