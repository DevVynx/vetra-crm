import { format, isBefore, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { inProfileZone, toInstant } from "@/shared/time-zone/zonedDate";

const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const SLOT_MINUTES = 30;

const slots = Array.from(
  { length: (LAST_HOUR - FIRST_HOUR + 1) * (60 / SLOT_MINUTES) },
  (_, index) => {
    const totalMinutes = FIRST_HOUR * 60 + index * SLOT_MINUTES;
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
  }
);

type TimeSlotListProps = {
  value: Date;
  onChange: (date: Date) => void;
  onDone: () => void;
  allowPast: boolean;
};

export function TimeSlotList({ value, onChange, onDone, allowPast }: TimeSlotListProps) {
  const zoned = inProfileZone(value);

  return (
    <div className="relative w-full max-sm:h-48 sm:w-36">
      <div className="absolute inset-0 py-4 max-sm:border-t">
        <ScrollArea className="h-full sm:border-s">
          <div className="space-y-3">
            <p className="px-5 text-sm font-medium capitalize">
              {format(zoned, "EEEE, d", { locale: ptBR })}
            </p>
            <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
              {slots.map((slot) => {
                const slotDate = setMinutes(setHours(zoned, slot.hours), slot.minutes);
                const isSelected =
                  slot.hours === zoned.getHours() && slot.minutes === zoned.getMinutes();
                return (
                  <Button
                    key={`${slot.hours}:${slot.minutes}`}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    disabled={!allowPast && isBefore(slotDate, new Date())}
                    onClick={() => {
                      onChange(toInstant(slotDate));
                      onDone();
                    }}
                  >
                    {format(slotDate, "HH:mm")}
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
