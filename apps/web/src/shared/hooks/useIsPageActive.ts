import { useEffect, useState } from "react";

const isActive = () => document.visibilityState === "visible" && document.hasFocus();

// Visible alone isn't enough: a window on a second monitor is visible without being looked at.
export function useIsPageActive() {
  const [active, setActive] = useState(isActive);

  useEffect(() => {
    const update = () => setActive(isActive());

    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);

    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
    };
  }, []);

  return active;
}
