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
app.use(express.static(__dirname+'/public'));

/*
REMOVED ELEMENTS:
- <sup class="footnoteref"...
- <h2 class= "num"
- <sup class="linenum"...
*/
let beo = beowulf.readBeo('./library/Beowulf/beo.html')
let gumere_obj = gumere.readGumere('./library/Beowulf/gumere2.html')
let gumere_simple = simpletext.readSimpleText('./library/Beowulf/gumere.html')
let morriswyatt = simpletext.readSimpleText('./library/Beowulf/morriswyatt.txt')
let anglosaxon = simpletext.readSimpleText('./library/Beowulf/anglosaxon.md')

app.use("/images", express.static(path.join(__dirname, "public")));
app.use("/js", express.static(path.join(__dirname, "public")));
app.use("/svg", express.static(path.join(__dirname, "public")));
app.use("/photos", express.static(path.join(__dirname, "public")));
app.use("/library", express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('./home.html').pipe(res)
});

app.get('/beo', (req, res) => {
    res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin' : '*'})
    res.end(JSON.stringify({'anglosaxon': anglosaxon, 'gumere_simple': gumere_simple, 'gumere_obj' : gumere_obj, 'beo': beo}))
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

console.log('hello')


module.exports = app;
