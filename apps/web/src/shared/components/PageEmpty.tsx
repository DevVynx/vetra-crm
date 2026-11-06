import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type PageEmptyProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
};

// The empty state of a whole list page: it fills the card, centered, with what to do next.
export function PageEmpty({ icon: Icon, title, description, children }: PageEmptyProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="bg-muted ring-border flex size-16 items-center justify-center rounded-2xl ring-1">
        <Icon className="text-muted-foreground size-7" strokeWidth={1.5} />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm/relaxed text-balance">{description}</p>
      </div>
      {children && (
        <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>
      )}
    </div>
  );
}
