import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type PropertyListProps = {
  children: ReactNode;
  className?: string;
};

export function PropertyList({ children, className }: PropertyListProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 text-sm",
        className
      )}
    >
      {children}
    </dl>
  );
}

type PropertyProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function Property({ label, children, className }: PropertyProps) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 break-words", className)}>{children}</dd>
    </>
  );
}
