import { useCallback, useState } from "react";

// A boolean remembered in this browser; storage can be unavailable, so it only ever falls
// back to the default.
export function usePersistentFlag(storageKey: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? defaultValue : stored === "true";
    } catch {
      return defaultValue;
    }
  });

  const toggle = useCallback(() => {
    setValue((current) => {
      const next = !current;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
      return next;
    });
  }, [storageKey]);

  return [value, toggle] as const;
}
