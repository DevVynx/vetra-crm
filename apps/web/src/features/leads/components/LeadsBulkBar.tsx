import { ArchiveIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { ArchiveLeadDialog } from "@/shared/components/ArchiveLeadDialog";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useStages } from "@/shared/stages/useStages";
import { pluralize } from "@/shared/utils/format";

import { useBulkChangeLeadStage } from "../mutations/useBulkChangeLeadStage";

type LeadsBulkBarProps = {
  ids: string[];
  onDone: () => void;
  onCancel: () => void;
};

// Floats over the list while leads are selected. Closing a lead is left out: it needs the deal data.
export function LeadsBulkBar({ ids, onDone, onCancel }: LeadsBulkBarProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const stages = useStages();
  const { changeStages, isPending } = useBulkChangeLeadStage(onDone);
  const summary = pluralize(ids.length, "lead", "leads");
  const isSingle = ids.length === 1;

  return (
    <div
      role="toolbar"
      aria-label="Ações em lote"
      className="bg-popover absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border p-1.5 shadow-lg"
    >
      <span className="px-2 text-sm font-medium tabular-nums">
        {ids.length} {ids.length === 1 ? "selecionado" : "selecionados"}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="outline" disabled={isPending}>
              Mudar etapa
              <ChevronUpIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="center" side="top">
          {stages.funnel
            .filter((stage) => stage.role !== "closing")
            .map((stage) => (
              <DropdownMenuItem
                key={stage.id}
                onClick={() =>
                  changeStages(
                    { ids, stage: stage.id },
                    `${isSingle ? "Movido" : `${ids.length} movidos`} para ${stage.name}.`
                  )
                }
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.name}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="outline" disabled={isPending} onClick={() => setIsArchiving(true)}>
        <ArchiveIcon />
        Arquivar
      </Button>

      <Button size="icon-sm" variant="ghost" aria-label="Cancelar seleção" onClick={onCancel}>
        <XIcon />
      </Button>

      <ArchiveLeadDialog
        open={isArchiving}
        onOpenChange={setIsArchiving}
        title={`Arquivar ${summary}?`}
        description={`${isSingle ? "Ele sai" : "Eles saem"} da lista e ${isSingle ? "fica" : "ficam"} em Arquivados, guardando a etapa em que parou. Dá para reativar quando quiser.`}
        isPending={isPending}
        onConfirm={(archiveStageId) => {
          changeStages(
            { ids, stage: archiveStageId },
            `${summary} ${isSingle ? "arquivado" : "arquivados"} com sucesso.`
          );
          setIsArchiving(false);
        }}
      />
    </div>
  );
}
