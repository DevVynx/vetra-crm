import type { Stage } from "@vetra/contracts";
import { STAGE_NAME_MAX_LENGTH } from "@vetra/contracts";
import { GripVerticalIcon, LockIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableInput,
  EditablePreview,
} from "@/shared/components/ui/editable";
import { SortableItem, SortableItemHandle } from "@/shared/components/ui/sortable";
import { useUpdateStage } from "@/shared/mutations/stages/useUpdateStage";
import { pluralize } from "@/shared/utils/format";

import { StageColorPopover } from "./StageColorPopover";

type StageRowProps = {
  stage: Stage;
  leadsCount: number;
  isSortable: boolean;
  onDelete?: () => void;
};

export function StageRow({ stage, leadsCount, isSortable, onDelete }: StageRowProps) {
  const updateStage = useUpdateStage();
  const [name, setName] = useState(stage.name);
  const [isEditing, setIsEditing] = useState(false);

  const notice =
    leadsCount > 0
      ? `${pluralize(leadsCount, "lead usa", "leads usam")} esta etapa; a mudança vale para todos eles.`
      : undefined;

  const save = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return setName(stage.name);
    if (trimmed !== stage.name) {
      updateStage.mutate({ id: stage.id, name: trimmed, color: stage.color });
    }
  };

  const row = (
    <div className="bg-card flex flex-col gap-1 px-3 py-2.5">
      <div className="flex items-center gap-1">
        {isSortable ? (
          <SortableItemHandle
            render={<Button size="icon-sm" variant="ghost" aria-label="Arrastar para reordenar" />}
          >
            <GripVerticalIcon />
          </SortableItemHandle>
        ) : (
          <span
            className="text-muted-foreground flex size-7 items-center justify-center"
            title="Posição fixa"
          >
            <LockIcon className="size-3.5" />
          </span>
        )}

        <StageColorPopover
          color={stage.color}
          notice={notice}
          onCommit={(color) => updateStage.mutate({ id: stage.id, name: stage.name, color })}
        />

        <Editable
          value={name}
          onValueChange={setName}
          onSubmit={save}
          onCancel={() => setName(stage.name)}
          onEditingChange={setIsEditing}
          maxLength={STAGE_NAME_MAX_LENGTH}
          className="min-w-0 flex-1"
        >
          <EditableArea>
            <EditablePreview className="truncate text-sm font-medium" />
            <EditableInput className="h-7 text-sm" />
          </EditableArea>
        </Editable>

        <span className="text-muted-foreground px-2 text-xs whitespace-nowrap tabular-nums">
          {pluralize(leadsCount, "lead", "leads")}
        </span>

        {onDelete ? (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Excluir etapa ${stage.name}`}
            title="Excluir etapa"
            onClick={onDelete}
          >
            <Trash2Icon />
          </Button>
        ) : (
          <span className="size-7" />
        )}
      </div>
      {isEditing && notice && <p className="text-muted-foreground px-2 text-xs">{notice}</p>}
    </div>
  );

  return isSortable ? <SortableItem value={stage.id}>{row}</SortableItem> : row;
}
