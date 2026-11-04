import { useEffect, useRef } from "react";

const OVERLAY_SELECTOR =
  '[role="dialog"], [role="alertdialog"], [role="menu"], [data-slot="popover-content"]';

const SPACE_CONTROL_SELECTOR =
  'button, [role="button"], [role="checkbox"], [role="switch"], [role="radio"], [role="tab"]';

// Space presses the focused control; it only works as a shortcut everywhere else.
function isSpaceOnControl(event: KeyboardEvent) {
  return (
    event.key === " " &&
    event.target instanceof Element &&
    event.target.closest(SPACE_CONTROL_SELECTOR) !== null
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function useHotkey(key: string, handler: (event: KeyboardEvent) => void, enabled = true) {
  const latestHandler = useRef(handler);

  useEffect(() => {
    latestHandler.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target) || document.querySelector(OVERLAY_SELECTOR)) return;
      if (isSpaceOnControl(event)) return;
      event.preventDefault();
      latestHandler.current(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, enabled]);
}
