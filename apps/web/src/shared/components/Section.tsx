import type { ComponentType, ReactNode } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type SectionProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  count?: number;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({
  title,
  icon: Icon,
  iconClassName,
  count,
  action,
  className,
  children,
}: SectionProps) {
  return (
    <section className={cn("bg-card flex flex-col gap-3 rounded-xl border p-4", className)}>
      <header className="flex items-center gap-2">
        <Icon className={cn("size-4", iconClassName)} />
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && <Badge variant="secondary">{count}</Badge>}
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </section>
  );
}
