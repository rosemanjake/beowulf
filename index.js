// View package version
// npm view <package-name> version
// Deploy app
// gcloud app deploy

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const beowulf = require('./server/beowulf')
const simpletext = require('./server/simpletext')
const gumere = require('./server/gumere')

const app = express();
app.use(express.static(__dirname+'/build'));
/*
REMOVED ELEMENTS:
- <sup class="footnoteref"...
- <h2 class= "num"
- <sup class="linenum"...
*/
let beo = beowulf.readBeo('./library/Beowulf/beo.html')
const chaptertitles = beo.chaptermap
const romanchapters = beo.romanchapters

let gumere_obj = gumere.readGumere('./library/Beowulf/gumere2.html')
const linerange = gumere_obj.linerange
let gumere_simple = simpletext.readSimpleText('./library/Beowulf/gumere.html', false, linerange)
let morriswyatt = simpletext.readSimpleText('./library/Beowulf/morriswyatt_simple.txt', false, linerange)
let anglosaxon = simpletext.readSimpleText('./library/Beowulf/anglosaxon.md', false, linerange)
let kirtlan = simpletext.readSimpleText('./library/Beowulf/kirtlan.md', true, linerange)

app.use("/images", express.static(path.join(__dirname, "public")));
app.use("/js", express.static(path.join(__dirname, "public")));
app.use("/svg", express.static(path.join(__dirname, "public")));
app.use("/photos", express.static(path.join(__dirname, "public")));
app.use("/library", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public")));

/*app.get('/', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('./home.html').pipe(res)
});*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
});

app.get('/m', (req, res) => {
    //res.header("Access-Control-Allow-Origin", "*");
    res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin' : '*'})
    res.end(JSON.stringify(chaptertitles))
});

// Get specific chapter
app.get('/c', (req,res) => {
    let version = req.query.v
    let chapter = req.query.c - 1

    let text
    switch(version) {
        case 'as':
            text = anglosaxon.chapters[chapter].text
            break
        case 'g':
            text = gumere_simple.chapters[chapter].text
            break
        case 'mw':
            text = morriswyatt.chapters[chapter].text
            break
        case 'p':
            text = kirtlan.chapters[chapter].text
            break
        default:
            text = "default case"
            break
    }

    res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin' : '*'})
    res.end(JSON.stringify([text, beo.sidenotemap[chapter + 1]]))
}); 

// Get map of the content
app.get('/beo', (req, res) => {
    //res.header("Access-Control-Allow-Origin", "*");
    res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin' : '*'})
    res.end(JSON.stringify({'anglosaxon': anglosaxon, 'gumere_simple': gumere_simple, 'gumere_obj' : gumere_obj, 'beo': beo, 'mw': morriswyatt, 'chapters': beo.chapters, 'chaptertitles': beo.chaptertitles, 'prose':kirtlan}))
});


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});


/*
let biglines = Array.from(Object.keys(beo.linemap))
biglines.forEach((line, i) => {
    if (i < 100){
        console.log(`${i + 2} => ${beo.linemap[i + 1]}`)
    }
})

gumere_obj.lines.forEach((line, i) => {
    if(i < 100){
        console.log(`${i + 1} => ${line.linetext}`)
    }
})*/



module.exports = app;
