import type { ReactNode } from "react";

type SectionEmptyRowProps = {
  text: string;
  children: ReactNode;
};

export function SectionEmptyRow({ text, children }: SectionEmptyRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed py-1.5 pr-1.5 pl-3">
      <p className="text-muted-foreground text-sm">{text}</p>
      {children}
    </div>
  );
}
