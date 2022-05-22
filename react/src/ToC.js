import { memo, useCallback } from "react";

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
    const handleChapterChange = useCallback(event => {
        props.setChapter(event.target.value)
      }, [props.onChapterChange])

    return(
      <div className='toc'>
      {
        props.chapternums
          //.map(chapnum => {<div className='tocentry' key={chapnum} onClick={() => {setChapter(parseInt(chapnum))}}>{"hi"}</div>}
          .map(chapnum =>
            <div className={(props.showentries) ? 'tocentry' : 'hidden'} key={chapnum} onClick={() => {handleChapterChange(parseInt(chapnum))}}>{romanise(parseInt(chapnum))}</div>
          )
      }
      </div>
    )
  }

export default memo(ToC)