import { Badge } from "@/shared/components/ui/badge";
import { useStages } from "@/shared/stages/useStages";

export function LeadStageBadge({ stage }: { stage: string }) {
  const stages = useStages();

  return (
    <Badge variant="outline">
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: stages.colorOf(stage) }}
      />
      {stages.nameOf(stage)}
    </Badge>
  );
}
