import { useEffect, useRef, useState } from "react";

// Runs the callback whenever the returned element scrolls into view, as used for loading more.
export function useOnVisible(onVisible: () => void) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const callbackRef = useRef(onVisible);

  useEffect(() => {
    callbackRef.current = onVisible;
  });

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) callbackRef.current();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return setElement;
}
