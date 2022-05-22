import React, { useState, useEffect, memo, useRef } from 'react';
import axios from 'axios';
import ChapterTitle from './ChapterTitle';

function MainText(props) {
    const [currtext, setText] = useState("")
    const [sidenotes, setNotes] = useState("")
    const [height, setHeight] = useState(0)
    const [spaceheight, setSpaceHeight] = useState(0)
    const mainref = useRef(null)
    const [showdialog, setShowDialog] = useState(false)
    const [dialogpos, setDialogPos] = useState(0)
    const [message, setMessage] = useState("")
    const [prevmessage, setPrevMessage] = useState("")

    // Fetch text from server
    useEffect(() => {
      axios.get(props.domain + 'c', {params: {v: props.version, c: props.chapter}}).then(res => {
        setText(res.data[0]);
        setNotes(res.data[1]);
        setShowDialog(false)
      });
      }, [props.chapter, props.version])

    // Update height of main text div
    useEffect(() => {
      setTimeout(() => {
        setHeight(mainref.current.scrollHeight) 
      }, 500)  
    }, [props.chapter, props.version])

    // Update height value on window resize
    useEffect(() => {
      const onResize = () => {
        setHeight(mainref.current.scrollHeight);
      }
      window.removeEventListener('resize', onResize);
      window.addEventListener('resize', onResize, { passive: true });

      return () => window.removeEventListener('resize', onResize);
      
    }, []);


    return (
    <>
    <div className='maincontainer' id='maincontainer'>
      <div className='knotcolumn' key='knot'></div>
      <div className ='maintextcontainer' key='maintext'>
        <div className='topspace'></div>     
        <ChapterTitle key="chaptertitle" chapter={props.chapter} chaptertitles={props.chaptertitles} position={"maincontainer"}/>
        <div ref={mainref} className={'maintext_notoc'} key='text' id='text'>{currtext}</div>
        <div className='bottomspace'></div>
      </div>
      <SideNotes key={"sidenotes"} chapheight={height} notes={sidenotes} chapter={props.chapter} version={props.version} showdialog={showdialog} ondialogchange={setShowDialog} onMessageChange={setMessage} prevmessage={prevmessage} onPrevMessageChange={setPrevMessage} onChangeDialogPos={setDialogPos}/>
    </div>
    {showdialog &&
      <Dialog pos={dialogpos} message={message} height={height}/>
    } 
    </>  
    )
  }

function Dialog(props){
  const [scrolloffset, setOffset] = useState(window.pageYOffset);

  useEffect(() => {
      const onScroll = () => setOffset(window.pageYOffset);
      window.removeEventListener('scroll', onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
  }, []);

  console.log(scrolloffset)

  return(
  <>
    <div className="dialogcontainer" style={{marginTop: `${props.pos - scrolloffset + 5}px`}}>
      <div className="dialog">{props.message}</div>
      <div className="dialogtriangle"></div>
    </div>
  </>
  )
}

function SideNotes(props){
  return(
    <>
    <div className='sidenotes' key='notes'>
    {
      Object.keys(props.notes)
      .map(position =>
        <SideNote key={`${Math.random() * 999999}`} chapheight={props.chapheight} currpos={parseFloat(position)} message={props.notes[position]} showdialog={props.showdialog} ondialogchange={props.ondialogchange} onMessageChange={props.onMessageChange} prevmessage={props.prevmessage} onPrevMessageChange={props.onPrevMessageChange} onChangeDialogPos={props.onChangeDialogPos}/>
      )     
    }
    </div>
    </>
  )
}

function SideNote(props){
  const [finalpos, setFinalPos] = useState((props.chapheight * (props.currpos) / 100) + 60) 

  return(
    <div className="sidenotebutton" style={{marginTop: `${finalpos}px`}} onClick={() => {
      if(props.showdialog && props.message != props.prevmessage){
        props.ondialogchange(props.showdialog)
      }
      else{
        props.ondialogchange(!props.showdialog)
      }

      props.onMessageChange(props.message)
      props.onPrevMessageChange(props.message)
      props.onChangeDialogPos(finalpos)
    }}></div>        
  )
}

export default memo(MainText)