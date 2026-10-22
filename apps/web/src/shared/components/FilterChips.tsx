import { Button } from "@/shared/components/ui/button";
import { selectedChoiceClass } from "@/shared/constants/choiceStyles";
import { cn } from "@/shared/utils/cn";

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
  color?: string;
};

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
};

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant="outline"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn("shrink-0", option.value === value && selectedChoiceClass)}
        >
          {option.color && (
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ backgroundColor: option.color }}
            />
          )}
          {option.label}
          {option.count !== undefined && (
            <span className="text-muted-foreground tabular-nums">{option.count}</span>
          )}
        </Button>
      ))}
    </div>
  );
}
