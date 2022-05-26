import React, { useState, useEffect, useCallback, memo } from 'react';

function BottomBar(props) {

  const changeChapter = (shift) => {
    if (shift + props.chapter > 43){
      props.onChapterChange(1)
    } else if(shift + props.chapter > 0){
      props.onChapterChange(props.chapter + shift)
    }
    else{
      props.onChapterChange(43)
    }
  }

  return (
    <>
    <div className="bottomcontainer">
      <div className='bottombar'>
          <div className='chapterbutton' onClick={() => props.onChapterChange(1)}>{"<<"}</div>
          <div className='chapterbutton' onClick={() => changeChapter(-1)}>{"<"}</div>
          <div className='chapterindicator'><div className="activechapter">{props.chapter}</div>{" / 43"}</div>
          <div className='chapterbutton' onClick={() => changeChapter(1)}>{">"}</div>
          <div className='chapterbutton' onClick={() => props.onChapterChange(43)}>{">>"}</div>
      </div>
      <div className='copyright'>© Jake Roseman 2022 | www.jakeroseman.com</div>
    </div>
    </>
  );
}



export default memo(BottomBar)