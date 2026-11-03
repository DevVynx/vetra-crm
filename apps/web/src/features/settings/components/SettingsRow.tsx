import type { ReactNode } from "react";

type SettingsRowProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsRow({ title, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        {description && <span className="text-muted-foreground text-xs">{description}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
