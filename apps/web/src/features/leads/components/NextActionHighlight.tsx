import type { NextAction } from "@vetra/contracts";

import { CompleteActionButton } from "@/shared/components/next-actions/CompleteActionButton";
import { EditNextActionButton } from "@/shared/components/next-actions/EditNextActionButton";
import { NextActionBody } from "@/shared/components/next-actions/NextActionBody";
import { NextActionSendStatus } from "@/shared/components/next-actions/NextActionSendStatus";
import { SendActionButton } from "@/shared/components/next-actions/SendActionButton";
import { cn } from "@/shared/utils/cn";
import { formatDayLabel, formatRelative, formatTime } from "@/shared/utils/date";

type NextActionHighlightProps = {
  action: NextAction;
  isOverdue: boolean;
};

export function NextActionHighlight({ action, isOverdue }: NextActionHighlightProps) {
  const dueAt = new Date(action.dueAt);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-lg border px-4 py-3",
        isOverdue ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Próxima
        </p>
        <p className="font-semibold">{action.description}</p>
        <p className="text-muted-foreground text-sm">
          {formatDayLabel(dueAt)} · {formatTime(dueAt)}
          {isOverdue && (
            <span className="text-destructive font-medium">
              {" · "}atrasada {formatRelative(dueAt)}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <SendActionButton action={action} />
        <EditNextActionButton action={action} />
        <CompleteActionButton action={action} />
      </div>
      {action.body && <NextActionBody body={action.body} />}
      <NextActionSendStatus action={action} />
    </div>
  );
}
