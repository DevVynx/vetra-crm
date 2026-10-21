import type { LeadStage } from "@vetra/contracts";

import { Badge } from "@/shared/components/ui/badge";

import { leadStageColor, leadStageLabels } from "../constants/leadStages";

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  return (
    <Badge variant="outline">
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: leadStageColor(stage) }}
      />
      {leadStageLabels[stage]}
    </Badge>
  );
}
