import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function DetailSkeleton() {
  return (
    <div className="flex flex-col lg:h-full lg:flex-row">
      <div className="p-6 lg:w-[30rem] lg:shrink-0 lg:border-r">
        <Skeleton className="h-96 w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

type DetailNotFoundProps = {
  icon: LucideIcon;
  title: string;
  backTo: "/leads" | "/customers";
  backLabel: string;
};

export function DetailNotFound({ icon, title, backTo, backLabel }: DetailNotFoundProps) {
  return (
    <div className="p-6">
      <SectionEmpty icon={icon} title={title}>
        <Button size="sm" variant="outline" nativeButton={false} render={<Link to={backTo} />}>
          {backLabel}
        </Button>
      </SectionEmpty>
    </div>
  );
}
