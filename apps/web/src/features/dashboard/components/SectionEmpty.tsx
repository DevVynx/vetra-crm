import type { LucideIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

type SectionEmptyProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export function SectionEmpty({ icon: Icon, title, description }: SectionEmptyProps) {
  return (
    <Empty className="border border-dashed py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  );
}
