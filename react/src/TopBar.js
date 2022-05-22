import React, { useState, useEffect, useCallback, memo } from 'react';
import ChapterTitle from './ChapterTitle';

function TopBar(props) {
  const [showtoc, setShowToC] = useState(false);
  const [showvdrop, setVDrop] = useState(false); // show version dropdown
  const [showoptions, setShowOptions] = useState(false); // show version dropdown

  return (
    <>
    <div className="topcontainer">
      <div className='topbar'>
        <div className="centercontainer">
          <div className="maintitle">BEOWULF</div>
          <div className="maintitleline"></div>
          <ChapterTitle chapter={props.chapter} chaptertitles={props.chaptertitles}/>
        </div>
        <div className="hamburgercontainer" onClick={() => setShowOptions(!showoptions)}>
          <svg viewBox="-55 0 100 80" width="40" height="40" className="hamburger">
            <rect width="15" height="15"></rect>
            <rect y="30" width="15" height="15"></rect>
            <rect y="60" width="15" height="15"></rect>
          </svg>
        </div>
      </div>
    </div>
    {showoptions &&
      <Options versions={props.versions} version={props.version} onVersionChange={props.onVersionChange} chapter={props.chapter} chapternums={props.chapternums} onChapterChange={props.onChapterChange}/>
    } 
    </>
    );
  }

// Good read on handling input: https://stackoverflow.com/questions/36683770/how-to-get-the-value-of-an-input-field-using-reactjs

function Options(props){
  const f = obj => Object.fromEntries(Object.entries(obj).map(a => a.reverse()))
  const versions = f(props.versions)

  const [showchapteroptions, setShowChapterOptions] = useState(false)
  const [showversionoptions, setShowVersionOptions] = useState(false)
  const [showabout, setShowAbout] = useState(false)

  const [chapterselection, setChapterSelection] = useState(props.chapter)

  const handleChapterSelection = () => {
    const selection = parseInt(chapterselection.replace(/\s*/gms,""))
    if (selection > 0 && selection < 44 && selection != props.chapter){
      props.onChapterChange(selection)
    }
    else{
      alert("Please insert number between 1 and 43.")
    }
  }

  // I should break this down into more components, I know
  return(
    <>
    <div className="optionscontainer">
    <div className="options">
      <div className="optionsheadingcontainer" onClick={() => setShowChapterOptions(!showchapteroptions)}>
        <div className='optionsheading'>Chapters</div>
        <div className={(showchapteroptions) ? 'optionsarrowactive' : 'optionsarrow'}></div>
      </div>
      {showchapteroptions &&
        <>
        <div className="optionstext">Current chapter: {props.chapter} of 43</div>
        <div className='navigationcontainer'>
          <div>Select Chapter:</div>
          <input type="text" name="chapter" className='chapterinput' onInput={e => setChapterSelection(e.target.value)}/>       
        </div>
        <div className='navigationbutton' onClick={handleChapterSelection}>Go</div>
        </>
      }     
      <div className="optionsheadingcontainer" onClick={() => setShowVersionOptions(!showversionoptions)}>
        <div className='optionsheading'>Versions</div>
        <div className={(showversionoptions) ? 'optionsarrowactive' : 'optionsarrow'}></div>
      </div>
      {showversionoptions &&
        <>
          <div className="menuversions">
          {
            Object.keys(props.versions)
              .map(version =>
                <div className={(version == versions[props.version]) ? 'activeversionentry' : 'versionentry'} key={version + "dropdown"} onClick={() => props.onVersionChange(props.versions[version])}>{version}</div>
              )
          }
          </div>
        </>
      }
      <div className="optionsheadingcontainer" onClick={() => setShowAbout(!showabout)}>
        <div className='optionsheading'>About</div>
        <div className={(showabout) ? 'optionsarrowactive' : 'optionsarrow'}></div>
      </div>
      {showabout &&
        <>
        <div className="optionstext">This website was designed and built by <a href="https://www.jakeroseman.com">Jake Roseman.</a></div>
        <div className="optionstext">All texts are in the public domain and sourced from project Gutenberg:</div>
        <ul>
          <li>Gummere, Francis. (1910). Beowulf. <a href="https://www.gutenberg.org/ebooks/981">Gutenberg</a></li>
          <li>Kirtlan, Ernest J. B. (1914). The Story of Beowulf. <a href="https://www.gutenberg.org/ebooks/50742">Gutenberg</a></li>
          <li>Morris, William. (1895). The Tale of Beowulf, Sometime King of the Folk of the Weder Geats. <a href="https://www.gutenberg.org/ebooks/20431">Gutenberg</a></li>
        </ul>
        </>
      }
    </div>
    </div>
    </>
  )
}

function Versions(props){
  return(
    <>
      {
      Object.keys(props.versions)
        .map(version =>
          <div className='versionentry' key={version + "dropdown"} onClick={() => props.onVersionChange(props.versions[version])}>{version}</div>
        )
      }
    </>
  )
}

function romanise (num) {
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

function ToC(props){
  return(
    <>
    {
      props.chapternums
        .map(chapnum =>
          <div className={(props.showentries) ? 'tocentry' : 'hidden'} key={chapnum} onClick={() => {props.onChapterChange(parseInt(chapnum))}}>{romanise(parseInt(chapnum))}</div>        
        )
    }
    </>
  )
}



export default memo(TopBar)