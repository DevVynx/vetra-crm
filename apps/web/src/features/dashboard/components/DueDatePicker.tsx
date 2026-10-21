import { isSameDay, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";

import { atDefaultHour, quickDueOptions } from "../utils/dueDates";

type DueDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
              variant={isSameDay(date, value) ? "secondary" : "outline"}
              onClick={() => onChange(date)}
            >
              {option.label}
            </Button>
          );
        })}
        <Button
          type="button"
          size="xs"
          variant={isCalendarOpen ? "secondary" : "ghost"}
          onClick={() => setIsCalendarOpen((open) => !open)}
        >
          Outra data
        </Button>
      </div>

      {isCalendarOpen && (
        <Calendar
          mode="single"
          locale={ptBR}
          selected={value}
          defaultMonth={value}
          disabled={{ before: startOfToday() }}
          onSelect={(date) => date && onChange(atDefaultHour(date))}
          className="rounded-md border p-2"
        />
      )}
    </div>
  );
}
