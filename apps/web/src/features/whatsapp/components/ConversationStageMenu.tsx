import type { Stage, WhatsappConversation } from "@vetra/contracts";
import { ArchiveIcon, Undo2Icon } from "lucide-react";
import { useState } from "react";

import { ArchiveLeadDialog } from "@/shared/components/ArchiveLeadDialog";
import { CloseLeadSheet } from "@/shared/components/leads/CloseLeadSheet";
import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useChangeLeadStage } from "@/shared/mutations/leads/useChangeLeadStage";
import { useStages } from "@/shared/stages/useStages";

type ConversationStageMenuProps = {
  lead: NonNullable<WhatsappConversation["lead"]>;
};

export function ConversationStageMenu({ lead }: ConversationStageMenuProps) {
  const [dialog, setDialog] = useState<"close" | "archive" | null>(null);
  const stages = useStages();
  const { changeStage, isPending } = useChangeLeadStage(lead.id);
  const closeDialog = (open: boolean) => !open && setDialog(null);

  const select = (stage: Stage) => {
    if (stage.role === "closing") return setDialog("close");
    changeStage(stage.id, lead.stage, `Movido para ${stage.name}.`);
  };

  const reactivate = () => {
    const target = lead.stoppedAtStage ?? stages.entry.id;
    changeStage(target, lead.stage, `Reativado em ${stages.nameOf(target)}.`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          aria-label="Alterar etapa"
          title="Alterar etapa"
          className="focus-visible:ring-ring/50 flex cursor-pointer rounded-full outline-none focus-visible:ring-3"
        >
          <LeadStageBadge stage={lead.stage} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {stages.isArchive(lead.stage) ? (
            <DropdownMenuItem onClick={reactivate}>
              <Undo2Icon />
              Reativar
            </DropdownMenuItem>
          ) : (
            <>
              {stages.funnel.map((stage) => (
                <DropdownMenuItem
                  key={stage.id}
                  disabled={stage.id === lead.stage}
                  onClick={() => select(stage)}
                >
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDialog("archive")}>
                <ArchiveIcon />
                Arquivar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CloseLeadSheet
        leadId={lead.id}
        businessName={lead.businessName}
        open={dialog === "close"}
        onOpenChange={closeDialog}
      />
      <ArchiveLeadDialog
        open={dialog === "archive"}
        onOpenChange={closeDialog}
        title={`Arquivar ${lead.businessName}?`}
        description="Ele sai da lista e fica em Arquivados, guardando a etapa em que parou. Dá para reativar quando quiser."
        isPending={isPending}
        onConfirm={(archiveStageId) => {
          changeStage(
            archiveStageId,
            lead.stage,
            `Lead arquivado em ${stages.nameOf(archiveStageId)}.`
          );
          setDialog(null);
        }}
      />
    </>
  );
}
