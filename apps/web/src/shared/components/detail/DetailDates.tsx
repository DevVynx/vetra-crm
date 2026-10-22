import { CalendarPlusIcon, type LucideIcon, RefreshCwIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { formatChipDateTime, formatRelative } from "@/shared/utils/date";

const dateKinds = {
  created: { label: "Criado", icon: CalendarPlusIcon },
  updated: { label: "Atualizado", icon: RefreshCwIcon },
} satisfies Record<string, { label: string; icon: LucideIcon }>;

type DetailDatesProps = {
  rows: { kind: keyof typeof dateKinds; date: string }[];
  className?: string;
};

export function DetailDates({ rows, className }: DetailDatesProps) {
  return (
    <dl className={cn("flex flex-col gap-2 border-t pt-4 text-xs", className)}>
      {rows.map(({ kind, date }) => {
        const { label, icon: Icon } = dateKinds[kind];
        const when = new Date(date);

        return (
          <div key={kind} title={formatRelative(when)} className="flex items-center gap-2">
            <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-md">
              <Icon className="size-3" />
            </span>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-foreground/80 ml-auto tabular-nums">{formatChipDateTime(when)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
