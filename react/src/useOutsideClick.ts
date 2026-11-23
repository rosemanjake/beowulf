import { RefObject, useEffect, useRef } from 'react';

export function useOutsideClick(
  trackedRefs: RefObject<HTMLElement | null>[],
  onDismiss: () => void,
  isActive = true,
  ignoreSelector: string | null = null
): void {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const trackedRefsRef = useRef(trackedRefs);
  trackedRefsRef.current = trackedRefs;

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    function handleMouseDown(event: MouseEvent): void {
      const target = event.target;
      if (
        ignoreSelector &&
        target instanceof Element &&
        target.closest(ignoreSelector)
      ) {
        return;
      }

      const clickedOutsideAll = trackedRefsRef.current.every(
        (ref) => !ref.current || !ref.current.contains(target as Node)
      );
      if (clickedOutsideAll) {
        onDismissRef.current();
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onDismissRef.current();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, ignoreSelector]);
}
