import type { NextAction } from "@vetra/contracts";
import { CalendarClockIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

import { useRescheduleNextAction } from "../mutations/useRescheduleNextAction";
import { DueDatePicker } from "./DueDatePicker";

export function ReschedulePopover({ action }: { action: NextAction }) {
  const [open, setOpen] = useState(false);
  const rescheduleNextAction = useRescheduleNextAction();

  const reschedule = (date: Date) =>
    rescheduleNextAction.mutate(
      { id: action.id, dueAt: date.toISOString() },
      { onSuccess: () => setOpen(false) }
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button size="icon-sm" variant="ghost" aria-label="Reagendar" title="Reagendar" />}
      >
        <CalendarClockIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <PopoverHeader>
          <PopoverTitle>Reagendar</PopoverTitle>
        </PopoverHeader>
        <DueDatePicker value={new Date(action.dueAt)} onChange={reschedule} />
      </PopoverContent>
    </Popover>
  );
}
