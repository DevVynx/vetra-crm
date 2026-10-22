import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

type StatusBadgeProps = {
  label: string;
  dotClassName: string;
};

export function StatusBadge({ label, dotClassName }: StatusBadgeProps) {
  return (
    <Badge variant="outline">
      <span aria-hidden className={cn("size-1.5 rounded-full", dotClassName)} />
      {label}
    </Badge>
  );
}
