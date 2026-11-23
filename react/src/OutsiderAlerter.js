import { useEffect, useRef } from 'react';

/**
 * Invokes onDismiss(false) when clicking outside all tracked refs or pressing Escape.
 * Supports optional ignoreSelector (e.g. '.sidenotebutton') so switching markers avoids flicker.
 */
function useOutsideAlerter(refs, onDismiss, isActive = true, ignoreSelector = null) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!isActive) return undefined;

    function handleClickOutside(event) {
      if (ignoreSelector && event.target instanceof Element && event.target.closest(ignoreSelector)) {
        return;
      }
      const clickedOutsideAll = refsRef.current.every(
        (ref) => !ref.current || !ref.current.contains(event.target)
      );
      if (clickedOutsideAll) {
        onDismissRef.current(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onDismissRef.current(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, ignoreSelector]);
}

export default useOutsideAlerter;
