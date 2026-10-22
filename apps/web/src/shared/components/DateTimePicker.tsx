import { format, setHours, setMinutes, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { ExactTimePanel } from "@/shared/components/date-time/ExactTimePanel";
import { TimeSlotList } from "@/shared/components/date-time/TimeSlotList";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { atDefaultHour } from "@/shared/utils/dueDates";

type DateTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  withTime?: boolean;
  // Swaps the 30-minute slots for hour and minute columns that reach any time of the day.
  exactTime?: boolean;
  allowPast?: boolean;
};

export function DateTimePicker({
  value,
  onChange,
  withTime = true,
  exactTime = false,
  allowPast = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectDate = (date: Date | undefined) => {
    if (!date) return;
    if (!withTime) {
      onChange(atDefaultHour(date));
      setOpen(false);
      return;
    }
    onChange(setMinutes(setHours(date, value.getHours()), value.getMinutes()));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="group/pick-date w-full justify-between font-normal"
          />
        }
      >
        <span className="truncate">
          {format(value, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy")}
        </span>
        <CalendarIcon
          aria-hidden="true"
          className="text-muted-foreground/80 group-hover/pick-date:text-foreground shrink-0 transition-colors"
        />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={value}
            defaultMonth={value}
            disabled={allowPast ? undefined : { before: startOfToday() }}
            onSelect={selectDate}
          />
          {withTime &&
            (exactTime ? (
              <ExactTimePanel
                value={value}
                onChange={onChange}
                onDone={() => setOpen(false)}
                allowPast={allowPast}
              />
            ) : (
              <TimeSlotList
                value={value}
                onChange={onChange}
                onDone={() => setOpen(false)}
                allowPast={allowPast}
              />
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
