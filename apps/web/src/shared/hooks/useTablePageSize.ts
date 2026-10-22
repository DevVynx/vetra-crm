import { useDeferredValue, useEffect, useState } from "react";

const HEADER_HEIGHT = 41;
const ROW_HEIGHT = 53;
const MIN_PAGE_SIZE = 3;

export const TABLE_MIN_HEIGHT = HEADER_HEIGHT + MIN_PAGE_SIZE * ROW_HEIGHT;

export function useTablePageSize() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  const fitting = Math.floor((height - HEADER_HEIGHT) / ROW_HEIGHT);
  const pageSize = height === 0 ? 0 : Math.max(MIN_PAGE_SIZE, fitting);

  return { ref: setElement, pageSize: useDeferredValue(pageSize) };
}
