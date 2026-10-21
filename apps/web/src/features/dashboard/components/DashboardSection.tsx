import type { ComponentType, ReactNode } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type DashboardSectionProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  count?: number;
  className?: string;
  children: ReactNode;
};

export function DashboardSection({
  title,
  icon: Icon,
  iconClassName,
  count,
  className,
  children,
}: DashboardSectionProps) {
  return (
    <section className={cn("bg-card flex flex-col gap-3 rounded-xl border p-4", className)}>
      <header className="flex items-center gap-2">
        <Icon className={cn("size-4", iconClassName)} />
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && <Badge variant="secondary">{count}</Badge>}
      </header>
      {children}
    </section>
  );
}
