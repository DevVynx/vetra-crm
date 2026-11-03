import type { Stage } from "@vetra/contracts";
import { useState } from "react";

import { Sortable, SortableContent, SortableOverlay } from "@/shared/components/ui/sortable";

import { StageRow } from "./StageRow";

type SortableStagesProps = {
  stages: Stage[];
  counts: Record<string, number>;
  canDelete: boolean;
  onReorder: (ids: string[]) => void;
  onDelete: (stage: Stage) => void;
};

export function SortableStages({
  stages,
  counts,
  canDelete,
  onReorder,
  onDelete,
}: SortableStagesProps) {
  const [items, setItems] = useState(stages);

  const handleChange = (next: Stage[]) => {
    setItems(next);
    onReorder(next.map((stage) => stage.id));
  };

  return (
    <Sortable value={items} onValueChange={handleChange} getItemValue={(stage) => stage.id}>
      <SortableContent className="divide-y">
        {items.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            leadsCount={counts[stage.id] ?? 0}
            isSortable
            onDelete={canDelete ? () => onDelete(stage) : undefined}
          />
        ))}
      </SortableContent>
      <SortableOverlay />
    </Sortable>
  );
}
