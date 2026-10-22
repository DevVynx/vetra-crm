import { isSameDay } from "date-fns";

import { DateTimePicker } from "@/shared/components/DateTimePicker";
import { Button } from "@/shared/components/ui/button";
import { selectedChoiceClass } from "@/shared/constants/choiceStyles";
import { cn } from "@/shared/utils/cn";
import { quickDueOptions } from "@/shared/utils/dueDates";

type DueDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  withTime?: boolean;
};

export function DueDatePicker({ value, onChange, withTime = true }: DueDatePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {quickDueOptions.map((option) => {
          const date = option.getDate();
          return (
            <Button
              key={option.label}
              type="button"
              size="xs"
              variant="outline"
              className={cn(isSameDay(date, value) && selectedChoiceClass)}
              onClick={() => onChange(date)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
      <DateTimePicker value={value} onChange={onChange} withTime={withTime} />
    </div>
  );
}
