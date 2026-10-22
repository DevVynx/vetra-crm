import type { NextAction } from "@vetra/contracts";
import { CalendarClockIcon } from "lucide-react";
import { useState } from "react";

import { DueDatePicker } from "@/shared/components/next-actions/DueDatePicker";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useRescheduleNextAction } from "@/shared/mutations/next-actions/useRescheduleNextAction";

export function ReschedulePopover({ action }: { action: NextAction }) {
  const [open, setOpen] = useState(false);
  const [dueAt, setDueAt] = useState(() => new Date(action.dueAt));
  const rescheduleNextAction = useRescheduleNextAction();

  const reschedule = () =>
    rescheduleNextAction.mutate(
      { id: action.id, dueAt: dueAt.toISOString() },
      { onSuccess: () => setOpen(false) }
    );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDueAt(new Date(action.dueAt));
        setOpen(next);
      }}
    >
      <PopoverTrigger
        render={<Button size="icon-sm" variant="ghost" aria-label="Reagendar" title="Reagendar" />}
      >
        <CalendarClockIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <PopoverHeader>
          <PopoverTitle>Reagendar</PopoverTitle>
        </PopoverHeader>
        <DueDatePicker value={dueAt} onChange={setDueAt} />
        <Button size="sm" disabled={rescheduleNextAction.isPending} onClick={reschedule}>
          Reagendar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
