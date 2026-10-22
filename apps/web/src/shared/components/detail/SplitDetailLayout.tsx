import type { ReactNode } from "react";

import { usePersistentFlag } from "@/shared/hooks/usePersistentFlag";
import { cn } from "@/shared/utils/cn";

import { DetailPanelContext } from "./DetailPanelContext";

type SplitDetailLayoutProps = {
  aside: ReactNode;
  footer: ReactNode;
  storageKey: string;
  children: ReactNode;
};

export function SplitDetailLayout({ aside, footer, storageKey, children }: SplitDetailLayoutProps) {
  const [open, toggle] = usePersistentFlag(storageKey, true);

  return (
    <DetailPanelContext.Provider value={{ open, toggle }}>
      <div className="flex flex-col lg:h-full lg:flex-row">
        <aside
          inert={!open}
          className={cn(
            "flex flex-col border-b lg:min-h-0 lg:shrink-0 lg:overflow-hidden lg:border-r lg:border-b-0",
            "lg:transition-[width] lg:duration-200 lg:ease-linear",
            open ? "lg:w-[30rem]" : "hidden lg:flex lg:w-0 lg:border-r-0"
          )}
        >
          {/* Keeps its width while the aside animates, so the content is clipped, not squeezed. */}
          <div className="flex flex-col lg:min-h-0 lg:w-[30rem] lg:flex-1">
            <div className="flex flex-col gap-4 p-6 lg:flex-1 lg:overflow-y-auto">{aside}</div>
            <div className="bg-muted/30 shrink-0 border-t px-6 py-4">{footer}</div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-6 p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {children}
        </div>
      </div>
    </DetailPanelContext.Provider>
  );
}
