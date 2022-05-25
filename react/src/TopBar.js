import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import ChapterTitle from './ChapterTitle';
import useOutsideAlerter from './OutsiderAlerter';

let timer = 0

function TopBar(props) {
  const [showtoc, setShowToC] = useState(false);
  const [showvdrop, setVDrop] = useState(false); // show version dropdown
  const [showoptions, setShowOptions] = useState(false); // show version dropdown
  const [showversionoptions, setShowVersionOptions] = useState(false)
  const [versionhover, setVersionHover] = useState(false)
  const [showchapteroptions, setShowChapterOptions] = useState(false)
  const [chapterhover, setChapterHover] = useState(false)

  const optionsref = useRef(null)
  const hamburgerref = useRef(null)

  const f = obj => Object.fromEntries(Object.entries(obj).map(a => a.reverse()))
  const flippedversions = f(props.versions)

  //useOutsideAlerter([optionsref, hamburgerref], onShowOptionsChange, showoptions)

  return (
    <>
    <div className="topcontainer">
      <div className='topbar'>
        <div className="centercontainer">
          <div className="maintitle">BEOWULF</div>
          <div className="maintitleline"></div>
          <ChapterTitle chapter={props.chapter} chaptertitles={props.chaptertitles}/>
        </div>
        <div className="topbuttons">
          <TopDropDown type={"Chapters"} showdropdown={showversionoptions} setShowDropDown={setShowVersionOptions} setOther={setShowChapterOptions} hoverstate={versionhover} setHoverState={setVersionHover} chaptertitles={props.chaptertitles} onChapterChange={props.onChapterChange} currchapter={props.chapter}/>         
          <TopDropDown type={"Translations"} showdropdown={showchapteroptions} setShowDropDown={setShowChapterOptions} setOther={setShowVersionOptions} hoverstate={chapterhover} setHoverState={setChapterHover} flippedversions={flippedversions} versions={props.versions} onVersionChange={props.onVersionChange} currversion={props.version}/>    
        </div>
        <div ref={hamburgerref} className="hamburgercontainer" onClick={() => {setShowOptions(!showoptions)}}>
          <svg viewBox="-55 0 100 80" width="40" height="40" className="hamburger">
            <rect width="15" height="15"></rect>
            <rect y="30" width="15" height="15"></rect>
            <rect y="60" width="15" height="15"></rect>
          </svg>
        </div>
      </div>
    </div>
    {showoptions &&
      <Options ref={optionsref} showoptions={showoptions} setShowOptions={setShowOptions} versions={props.versions} version={props.version} onVersionChange={props.onVersionChange} chapter={props.chapter} chapternums={props.chapternums} onChapterChange={props.onChapterChange}/>
    } 
    </>
    );
  }

  const throttle = (func, limit) => {
    let inThrottle
    console.log(inThrottle)
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  

// Good read on handling input: https://stackoverflow.com/questions/36683770/how-to-get-the-value-of-an-input-field-using-reactjs

function TopDropDown(props){
  const mainref = useRef(null)
  useOutsideAlerter([mainref], props.setShowDropDown, props.showdropdown)

  const containerclass = (props.type === 'Chapters') ? 'chapterdropdown' : 'dropdownbuttoncontainer'

  return (
    <>
    <div ref={mainref} className="dropdowncontainer" 
      onClick={() => 
        {
          props.setShowDropDown(!props.showdropdown);
          props.setHoverState(false);
          props.setOther(false);
        }
      }
      onMouseOver={() => props.setHoverState(true)} 
      onMouseOut={() => props.setHoverState(false)}
    >
    <div className={containerclass}>
      <div className='dropdown'
        style={(props.hoverstate) ? {color: "var(--gold)"} : {}}
      >{props.type}</div>
      <div 
        className={(props.showdropdown) ? 'optionsarrowactive' : 'optionsarrow'}
        style={(props.hoverstate) ? {borderLeft: "7px solid var(--gold)"} : {}}
      ></div>
    </div>
    {props.type === "Translations" &&
      <VersionItems showdropdown={props.showdropdown} flippedversions={props.flippedversions} onVersionChange={props.onVersionChange} versions={props.versions} currversion={props.currversion}/>
    }
    {props.type === 'Chapters' &&
      <ChapterItems chaptertitles={props.chaptertitles} showdropdown={props.showdropdown} setShowDropDown={props.setShowDropDown} onChapterChange={props.onChapterChange} currchapter={props.currchapter}/>
    }
    </div>  
    </>
  )

}

function VersionItems(props){
  return(
    <>
    {props.showdropdown &&
      <>
        <div className="menuversions">
        {
          Object.keys(props.versions)
            .map(version =>
              <div className={(version == props.flippedversions[props.currversion]) ? 'activeversionentry' : 'versionentry'} key={version + "dropdown"} onClick={() => props.onVersionChange(props.versions[version])}>{version}</div>
            )
        }
        </div>
      </>
    }
    </>
  )
}

function ChapterItems(props){

  return(
    <>
    <div className='bigdropdown'>
    {props.showdropdown &&
      <>
        <div className="menuversions">
        {
          Object.keys(props.chaptertitles)
            .map(chapter =>
              <div className={(chapter == props.currchapter) ? 'activechapterentry' : 'chapterentry'} key={chapter + "dropdown"} onClick={() => props.onChapterChange(parseInt(chapter))}>{chapter}</div>
            )
        }
        </div>
      </>
    }
    </div>
    </>
  )
}

const Options = React.forwardRef((props, optionsref) => {
  //useOutsideAlerter(mainref, props.setShowOptions, props.showoptions)

  return(
    <>
    <div ref={optionsref} className="optionscontainer">
    <div className="options">
      <div className="donatebutton" onClick={() => window.open("https://www.paypal.com/donate/?hosted_button_id=TNN9K9X56KVPQ")}>Donate</div> 
      <div className="optionstext">This website was designed and built by <a href="https://www.jakeroseman.com">Jake Roseman.</a></div>
      <div className="optionstext">The source code is available <a href="https://github.com/rosemanjake/beowulf">here.</a></div>
      <div className="optionstext">All texts are in the public domain and sourced from project Gutenberg:</div>
      <ul>
        <li>Gummere, Francis. (1910). <i>Beowulf.</i> <a href="https://www.gutenberg.org/ebooks/981">Gutenberg</a></li>
        <li>Hall, Lessie. (1892). <i>Beowulf: An Anglo-Saxon Epic Poem.</i> <a href="https://www.gutenberg.org/ebooks/16328">Gutenberg</a></li>
        <li>Kirtlan, Ernest J. B. (1914). <i>The Story of Beowulf.</i> <a href="https://www.gutenberg.org/ebooks/50742">Gutenberg</a></li>
        <li>Morris, William. (1895). <i>The Tale of Beowulf, Sometime King of the Folk of the Weder Geats.</i> <a href="https://www.gutenberg.org/ebooks/20431">Gutenberg</a></li>
      </ul>   
    </div>
    </div>
    </>
  )
});

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