import { memo } from "react";

function ChapterTitle(props){
    return (
      <>
        <div className={(props.position === 'maincontainer') ? 'mobilechaptertitle' : 'chaptertitle'}>{props.chaptertitles[props.chapter]}</div>
      </>    
    )
  }

export default memo(ChapterTitle)