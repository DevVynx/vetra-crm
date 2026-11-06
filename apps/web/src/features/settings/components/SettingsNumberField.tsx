import { useEffect, useRef, useState } from "react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";

// How long after the last change a valid number is saved by itself. It covers typing (so "1" is not saved on the
// way to "14") and the little arrows of the field, which change the number but never take the focus away.
const SAVE_DELAY_IN_MS = 600;

type SettingsNumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  className?: string;
  onSave: (value: number) => void;
};

// A whole number of a setting. It is saved when it settles (typing or the arrows), when the field loses the focus
// and on Enter; an invalid or unchanged number is dropped and the saved one is shown again.
export function SettingsNumberField({
  label,
  value,
  min,
  max,
  className,
  onSave,
}: SettingsNumberFieldProps) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // What was just sent and has not come back yet, so the save of the pause and the one of the blur are not two requests.
  const lastSent = useRef<number | null>(null);

  useEffect(() => {
    lastSent.current = null;
  }, [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const save = (raw: string) => {
    const number = Number(raw);
    const isValid = raw.trim() !== "" && Number.isInteger(number) && number >= min && number <= max;
    if (!isValid || number === value || number === lastSent.current) return;

    lastSent.current = number;
    onSave(number);
  };

  return (
    <Input
      aria-label={label}
      type="number"
      min={min}
      max={max}
      className={cn("h-9 w-20 text-right", className)}
      value={text ?? String(value)}
      onChange={(event) => {
        const raw = event.target.value;
        setText(raw);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => save(raw), SAVE_DELAY_IN_MS);
      }}
      onBlur={() => {
        clearTimeout(timer.current);
        if (text !== null) save(text);
        lastSent.current = null;
        setText(null);
      }}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
    />
  );
}
