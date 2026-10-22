import { CheckIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { selectedChoiceClass } from "@/shared/constants/choiceStyles";
import { cn } from "@/shared/utils/cn";

type SegmentedChoiceProps<T extends string> = {
  ariaLabel: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedChoice<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: SegmentedChoiceProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          variant="outline"
          className={cn(value === option.value && selectedChoiceClass)}
          onClick={() => onChange(option.value)}
        >
          {value === option.value && <CheckIcon />}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
