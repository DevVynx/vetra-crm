import { startTransition, useEffect, useState } from "react";

// A callback ref (not useRef) so it also works when the element mounts after the first
// render, e.g. behind a loading state. The update is a transition so a layout animation
// (e.g. the sidebar collapsing) does not re-render the consumer on every frame.
export function useElementWidth<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) startTransition(() => setWidth(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, width };
}
