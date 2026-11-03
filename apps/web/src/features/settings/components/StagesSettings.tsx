import type { Stage } from "@vetra/contracts";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { useDeleteStage } from "@/shared/mutations/stages/useDeleteStage";
import { useReorderStages } from "@/shared/mutations/stages/useReorderStages";
import { useStageLeadCounts } from "@/shared/queries/stages/useStageLeadCounts";
import { useStages } from "@/shared/stages/useStages";
import { pluralize } from "@/shared/utils/format";

import { CreateStageSheet } from "./CreateStageSheet";
import { SettingsSection } from "./SettingsSection";
import { SortableStages } from "./SortableStages";
import { StageRow } from "./StageRow";

type CreateRole = "middle" | "archive";

const signature = (stages: Stage[]) =>
  stages.map((stage) => `${stage.id}:${stage.name}:${stage.color}`).join("|");

type AddStageRowProps = {
  onClick: () => void;
};

function AddStageRow({ onClick }: AddStageRowProps) {
  return (
    <Button
      variant="ghost"
      className="text-muted-foreground hover:text-foreground h-11 w-full justify-start rounded-none px-5"
      onClick={onClick}
    >
      <PlusIcon />
      Adicionar etapa
    </Button>
  );
}

export function StagesSettings() {
  const stages = useStages();
  const { data } = useStageLeadCounts();
  const reorderStages = useReorderStages();
  const deleteStage = useDeleteStage();
  const [creating, setCreating] = useState<CreateRole | null>(null);
  const [deleting, setDeleting] = useState<Stage | null>(null);
  const counts = data?.counts ?? {};

  const middleIds = stages.middle.map((stage) => stage.id);
  const archiveIds = stages.archive.map((stage) => stage.id);

  const destinationFor = (stage: Stage): Stage | undefined => {
    const group = stage.role === "archive" ? stages.archive : stages.funnel;
    const index = group.findIndex((item) => item.id === stage.id);
    return group[index - 1] ?? group[index + 1];
  };

  const destination = deleting ? destinationFor(deleting) : undefined;
  const deletingCount = deleting ? (counts[deleting.id] ?? 0) : 0;

  return (
    <>
      <SettingsSection
        title="Etapas do lead"
        description="Renomear ou trocar a cor vale para todos os leads da etapa. A primeira e a de fechamento ficam sempre nas pontas."
      >
        <StageRow
          stage={stages.entry}
          leadsCount={counts[stages.entry.id] ?? 0}
          isSortable={false}
        />
        <SortableStages
          key={signature(stages.middle)}
          stages={stages.middle}
          counts={counts}
          canDelete={stages.middle.length > 1}
          onReorder={(ids) => reorderStages.mutate({ middleIds: ids, archiveIds })}
          onDelete={setDeleting}
        />
        <StageRow
          stage={stages.closing}
          leadsCount={counts[stages.closing.id] ?? 0}
          isSortable={false}
        />
        <AddStageRow onClick={() => setCreating("middle")} />
      </SettingsSection>

      <SettingsSection
        title="Arquivamento"
        description="Etapas fora do funil, onde ficam os leads arquivados."
      >
        <SortableStages
          key={signature(stages.archive)}
          stages={stages.archive}
          counts={counts}
          canDelete={stages.archive.length > 1}
          onReorder={(ids) => reorderStages.mutate({ middleIds, archiveIds: ids })}
          onDelete={setDeleting}
        />
        <AddStageRow onClick={() => setCreating("archive")} />
      </SettingsSection>

      {creating && (
        <CreateStageSheet
          role={creating}
          open
          onOpenChange={(open) => !open && setCreating(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Excluir a etapa ${deleting?.name ?? ""}?`}
        description={
          deletingCount > 0 && destination
            ? `${pluralize(deletingCount, "lead vai", "leads vão")} para a etapa ${destination.name}.`
            : "Nenhum lead usa esta etapa."
        }
        confirmLabel="Excluir"
        destructive
        isPending={deleteStage.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteStage.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </>
  );
}
