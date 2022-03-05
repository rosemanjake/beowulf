const domain = 'http://localhost:8080/'
let data
let currchap = 1
let currtext
let currversion = 0

const versions = [
    'anglosaxon',
    'gumere_simple'
]

async function init(){
    data = await getContent()

    currtext = data[versions[currversion]].text
    displayCurrChap(currchap, currtext)
}

function clearSideNotes(){
    let notecontainer = document.getElementById("sidenotes")
    notecontainer.innerHTML = ''
}

function getSideNotes(){
    clearSideNotes()
    let sidenotes = data['beo'].sidenotemap[currchap]
    let chapheight = document.getElementById("maincontent").scrollHeight
    let notecontainer = document.getElementById("sidenotes")

    Array.from(Object.keys(sidenotes)).forEach((position) =>{
        let offset = chapheight * (position/100)
        let newnote = document.createElement('div')
        newnote.className = 'note'
        newnote.style.marginTop = `${offset}px`
        newnote.onclick = displaysidenote
        newnote.chapter = currchap
        newnote.key = position
        notecontainer.appendChild(newnote)

    })
}

function displaysidenote(){
    let sidenotes = data['beo'].sidenotemap[this.chapter]

    console.log(sidenotes[this.key])
}

function changeChapter(index){
    let newindex = currchap + index
    if (newindex > 0 && newindex <= Object.keys(data['gumere_obj'].chapters).length - 1){
        displayCurrChap(newindex, currtext)
        currchap = newindex
    }
}

function displayCurrChap(currchap, text){
    let linerange = getCurrLineRange(currchap)
    let lines = getLines(linerange[0], linerange[1], text)
    
    let content = document.getElementById("maincontent")
    content.innerHTML = `<pre class="maintext">${lines}</pre>`

    getSideNotes()
}

function getCurrLineRange(currchap){
    return data['gumere_obj'].linerange[currchap] 
}

function getLines(startindex, endindex, text){
    lines = text.split("\n")
    lines = lines.slice(startindex - 1, endindex)
    return lines.join("")
}

function switchVersion(index){
    let newindex = currversion + index
    
    if (newindex > -1 && newindex <= versions.length - 1){
        currversion = newindex
    }
    else if (newindex > versions.length - 1){
        currversion = 0
    }
    
    displayCurrChap(currchap, data[versions[currversion]].text)
}

async function getContent(){
    const req = new Request(`${domain}beo`)
    let res = await fetch(req)
    let json = await res.json()
    return json
}