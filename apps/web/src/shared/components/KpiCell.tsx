import { type LucideIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";
import { formatSignedPercent } from "@/shared/utils/format";

export type Kpi = {
  label: string;
  icon: LucideIcon;
  accentClassName: string;
  value: string;
  valueSuffix?: string;
  valueClassName?: string;
  compact?: boolean;
  context?: string;
  changeRatio?: number | null;
};

function ChangeBadge({ ratio }: { ratio: number }) {
  const Icon = ratio < 0 ? TrendingDownIcon : TrendingUpIcon;

  return (
    <span
      title="Comparado ao período anterior"
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        ratio > 0 && "bg-success/10 text-success",
        ratio < 0 && "bg-destructive/10 text-destructive",
        ratio === 0 && "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {formatSignedPercent(ratio)}
    </span>
  );
}

export function KpiCell({
  label,
  icon: Icon,
  accentClassName,
  value,
  valueSuffix,
  valueClassName,
  compact = false,
  context,
  changeRatio,
}: Kpi) {
  return (
    <div className={cn("bg-card flex flex-col", compact ? "gap-1 px-3 py-2.5" : "gap-2 p-4")}>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <div className={cn("flex items-center gap-1.5 text-sm font-semibold", accentClassName)}>
          <Icon className="size-4" />
          {label}
        </div>
        {changeRatio != null && <ChangeBadge ratio={changeRatio} />}
      </div>
      <p
        className={cn(
          "font-semibold tracking-tight tabular-nums",
          compact ? "text-xl" : "text-3xl",
          valueClassName
        )}
      >
        {value}
        {valueSuffix && (
          <span className="text-muted-foreground text-sm font-normal">{valueSuffix}</span>
        )}
      </p>
      {context && <p className="text-muted-foreground text-xs">{context}</p>}
    </div>
  );
}

export function KpiGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("bg-border grid gap-px overflow-hidden rounded-xl border", className)}>
      {children}
    </div>
  );
}
