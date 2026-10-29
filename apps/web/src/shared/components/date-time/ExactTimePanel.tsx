import { format, isToday, setHours, setMinutes } from "date-fns";

import { Button } from "@/shared/components/ui/button";
import {
  parseTimeValue,
  TimePicker,
  TimePickerColumns,
  type TimePickerI18nOverrides,
  TimePickerNow,
} from "@/shared/components/ui/time-picker";

const i18n: TimePickerI18nOverrides = {
  labels: { hour: "Hora", minute: "Minuto", now: "Agora", panelLabel: "Escolher horário" },
};

type ExactTimePanelProps = {
  value: Date;
  onChange: (date: Date) => void;
  onDone: () => void;
  allowPast: boolean;
};

// Hour and minute columns for any time of the day. 6 rows keep it as tall as the calendar beside it.
export function ExactTimePanel({ value, onChange, onDone, allowPast }: ExactTimePanelProps) {
  const selectTime = (text: string | null) => {
    const time = parseTimeValue(text);
    if (time) onChange(setMinutes(setHours(value, time.hour), time.minute));
  };

  return (
    <div className="flex flex-col justify-between [--time-picker-rows:6] max-sm:border-t sm:border-s">
      <TimePicker
        value={format(value, "HH:mm")}
        onValueChange={selectTime}
        min={!allowPast && isToday(value) ? format(new Date(), "HH:mm") : undefined}
        i18n={i18n}
      >
        <TimePickerColumns />
        <div className="flex items-center justify-between gap-2 border-t p-1.5">
          <TimePickerNow />
          <Button type="button" variant="secondary" className="font-semibold" onClick={onDone}>
            OK
          </Button>
        </div>
      </TimePicker>
    </div>
  );
}
