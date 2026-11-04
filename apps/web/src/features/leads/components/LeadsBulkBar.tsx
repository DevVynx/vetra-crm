import { ArchiveIcon, ChevronDownIcon } from "lucide-react";
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

type LeadsBulkBarProps = {
  ids: string[];
  // Set when there are more leads to select than the ones already selected.
  selectAll?: { total: number; isPending: boolean; onClick: () => void } | undefined;
  changeStages: (change: { ids: string[]; stage: string }, message: string) => void;
  isChanging: boolean;
};

// Takes the place of the column headers while leads are selected. Closing a lead is left out: it
// needs the deal data.
export function LeadsBulkBar({ ids, selectAll, changeStages, isChanging }: LeadsBulkBarProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const stages = useStages();
  const summary = pluralize(ids.length, "lead", "leads");
  const isSingle = ids.length === 1;

  return (
    <div role="toolbar" aria-label="Ações em lote" className="flex w-full items-center gap-2">
      <span className="truncate font-semibold tabular-nums">
        {ids.length} {isSingle ? "selecionado" : "selecionados"}
      </span>

      {selectAll && (
        <Button
          size="sm"
          variant="link"
          className="px-1 font-medium underline underline-offset-3 max-sm:hidden"
          disabled={selectAll.isPending}
          onClick={selectAll.onClick}
        >
          Selecionar todos os {selectAll.total}
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" variant="outline" disabled={isChanging}>
                Mudar etapa
                <ChevronDownIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
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

        <Button
          size="sm"
          variant="outline"
          disabled={isChanging}
          onClick={() => setIsArchiving(true)}
        >
          <ArchiveIcon />
          <span className="max-sm:sr-only">Arquivar</span>
        </Button>
      </div>

      <ArchiveLeadDialog
        open={isArchiving}
        onOpenChange={setIsArchiving}
        title={`Arquivar ${summary}?`}
        description={`${isSingle ? "Ele sai" : "Eles saem"} da lista e ${isSingle ? "fica" : "ficam"} em Arquivados, guardando a etapa em que parou. Dá para reativar quando quiser.`}
        isPending={isChanging}
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
