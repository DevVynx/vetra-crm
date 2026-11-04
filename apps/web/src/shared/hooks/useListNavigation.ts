import { useState } from "react";

import { useHotkey } from "./useHotkey";

type ListNavigationOptions = {
  count: number;
  resetKey: string;
  onActivate: (index: number) => void;
};

export function useListNavigation({ count, resetKey, onActivate }: ListNavigationOptions) {
  const [position, setPosition] = useState({ index: -1, resetKey });
  const activeIndex = position.resetKey === resetKey ? position.index : -1;

  const moveTo = (index: number) => setPosition({ index, resetKey });

  useHotkey("ArrowDown", () => moveTo(Math.min(activeIndex + 1, count - 1)), count > 0);
  useHotkey("ArrowUp", () => moveTo(Math.max(activeIndex - 1, 0)), count > 0 && activeIndex > 0);
  useHotkey("Enter", () => onActivate(activeIndex), activeIndex >= 0);

  return { activeIndex, moveTo };
}
