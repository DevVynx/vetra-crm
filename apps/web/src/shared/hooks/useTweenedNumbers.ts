import { useEffect, useRef, useState } from "react";

const easeInOut = (progress: number) => progress * progress * (3 - 2 * progress);

// Moves from the current values to the target ones, starting from zeros on mount.
// Skips the motion for people who ask for reduced motion.
export function useTweenedNumbers(target: number[], duration = 1000) {
  const [values, setValues] = useState(() => target.map(() => 0));
  const latest = useRef(values);
  const key = target.join(",");

  useEffect(() => {
    const goal = key ? key.split(",").map(Number) : [];
    const from = goal.map((_, index) => latest.current[index] ?? 0);
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = instant ? 1 : Math.min((now - start) / duration, 1);
      const eased = easeInOut(progress);
      latest.current = goal.map((end, index) => from[index]! + (end - from[index]!) * eased);
      setValues(latest.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [key, duration]);

  return values;
}
