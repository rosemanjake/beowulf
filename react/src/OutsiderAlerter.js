import React, { useRef, useEffect } from "react";

// Pass this a div's reference, setState function, and state variable
// It makes it so that if you click outside that div, it will turn the state false (hiding the div)
function useOutsideAlerter(refs, changeState, state) {


  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      refs.forEach(ref => {
        if (ref.current && !ref.current.contains(event.target)) {
          //alert("You clicked outside of me!");
          changeState(false)  
        }
      })
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs]);
}

export default useOutsideAlerter