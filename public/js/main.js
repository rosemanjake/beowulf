const domain = 'http://localhost:8080/'
let data
let currchap = 1
let currtext
let currversion = 0
let prose = false

const versions = [
    'anglosaxon',
    'gumere_simple',
    'mw'
]

async function init(){
    data = await getContent()

    currtext = data[versions[currversion]].text
    displayCurrChap(currchap, currtext)
    displayToC()
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

function displayToC(){
    let toccontainer = document.getElementById("toc")

    data['gumere_obj'].chapters.forEach((chapter, i) => {
        let tocentry = document.createElement("div")
        //i == 0 ? tocentry.innerHTML = "prelude" : tocentry.innerHTML = i
        tocentry.innerHTML = romanize(i+1)
        tocentry.chapno = i + 1
        tocentry.addEventListener('click', function(){
            currchap = this.chapno
            displayCurrChap(currchap, currtext)
        })
        toccontainer.appendChild(tocentry)
    })
}

function displaysidenote(){
    let sidenotes = data['beo'].sidenotemap[this.chapter]

    console.log(sidenotes[this.key])
}

function changeChapter(index){
    let newindex = currchap + index
    if (newindex > 0 && newindex <= Object.keys(data['gumere_obj'].chapters).length){
        displayCurrChap(newindex, currtext)
        currchap = newindex
    }
}

function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

function displayCurrChap(currchap, text){
    let linerange = getCurrLineRange(currchap)
    let lines = getLines(linerange[0], linerange[1], text)
    
    let content = document.getElementById("maincontent")
    content.innerHTML = `<pre class="maintext">${lines}</pre>`

    let title = data['chaptertitles'][currchap - 1]
    //let title = romanize(currchap -1)
    
    let titlecontainer = document.getElementById("chaptertitle")
    titlecontainer.innerHTML = title


    getSideNotes()
}

function getCurrLineRange(currchap){
    return data['gumere_obj'].linerange[currchap] 
}

function getLines(startindex, endindex, text){
    lines = text.split("\n")
    lines = lines.slice(startindex - 1, endindex)
    return lines.join("~\n")
}

function switchVersion(index){
    let newindex = currversion + index
    
    if (newindex > -1 && newindex < versions.length){
        currversion = newindex
    }
    else if (newindex == versions.length){
        currversion = 0
    }
    else if (newindex < 0){
        currversion = versions.length - 1
    }
    
    currtext = data[versions[currversion]].text
    displayCurrChap(currchap, currtext)
}

async function getContent(){
    const req = new Request(`${domain}beo`)
    let res = await fetch(req)
    let json = await res.json()
    return json
}

function changeType(){
    prose = !prose

    displayProseChap()
}

function displayProseChap(){
    let currtext = data['prose'].text
    let chapter = data['prose'].chapters[currchap - 1].text
    
    let content = document.getElementById("maincontent")
    content.innerHTML = `<pre class="maintext">${chapter}</pre>`

    let title = data['chaptertitles'][currchap - 1]
    //let title = romanize(currchap -1)
    
    let titlecontainer = document.getElementById("chaptertitle")
    titlecontainer.innerHTML = title

    getSideNotes()
}