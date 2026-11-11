import { ClockIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useCancelFollowUps } from "@/shared/mutations/next-actions/useCancelFollowUps";
import { useLeadNextActions } from "@/shared/queries/next-actions/useLeadNextActions";
import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatTime } from "@/shared/utils/date";

// The follow-up Vetra will send by itself or remind about, so it is never a surprise, with the way to stop it.
type ScheduledFollowUpNoticeProps = { leadId: string; className?: string };

export function ScheduledFollowUpNotice({ leadId, className }: ScheduledFollowUpNoticeProps) {
  const { data } = useLeadNextActions(leadId);
  const cancel = useCancelFollowUps(leadId);
  const [next] = data?.nextActions.filter(({ type }) => type === "follow_up") ?? [];

  if (!next) return null;

  const dueAt = new Date(next.dueAt);

  return (
    <div className={cn("bg-muted/40 flex items-center gap-2 px-3 py-2 text-xs", className)}>
      <ClockIcon className="text-muted-foreground size-3.5 shrink-0" />
      <span className="text-muted-foreground min-w-0 flex-1 truncate">
        <span className="text-foreground font-medium">{next.description}</span> agendado para{" "}
        {formatDayLabel(dueAt)}, {formatTime(dueAt)}
      </span>
      <Button
        size="xs"
        variant="outline"
        disabled={cancel.isPending}
        onClick={() => cancel.mutate()}
      >
        Cancelar
      </Button>
    </div>
  );
}
