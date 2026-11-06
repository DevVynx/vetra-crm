import type { LeadDetail } from "@vetra/contracts";
import { ArchiveIcon, BanIcon, CircleCheckIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { ActionsMenu, type ActionsMenuItem } from "@/shared/components/ActionsMenu";
import { ArchiveLeadDialog } from "@/shared/components/ArchiveLeadDialog";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { useChangeLeadStage } from "@/shared/mutations/leads/useChangeLeadStage";
import { useStages } from "@/shared/stages/useStages";

import { useDeleteLead } from "../mutations/useDeleteLead";
import { useUpdateLeadDoNotContact } from "../mutations/useUpdateLeadDoNotContact";
import { EditLeadSheet } from "./EditLeadSheet";

type Dialog = "edit" | "archive" | "delete" | null;

export function LeadActionsMenu({ lead }: { lead: LeadDetail }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const { changeStage, isPending: isChanging } = useChangeLeadStage(lead.id);
  const deleteLead = useDeleteLead(lead.id);
  const doNotContact = useUpdateLeadDoNotContact(lead.id);
  const stages = useStages();
  const isArchived = stages.isArchive(lead.stage);
  const close = () => setDialog(null);

  const items: ActionsMenuItem[] = [
    { label: "Editar lead", icon: PencilIcon, onSelect: () => setDialog("edit") },
    lead.doNotContact
      ? {
          label: "Permitir contato",
          icon: CircleCheckIcon,
          onSelect: () => doNotContact.change(false),
        }
      : {
          label: "Marcar como não contatar",
          icon: BanIcon,
          onSelect: () => doNotContact.change(true),
        },
    ...(isArchived
      ? []
      : [{ label: "Arquivar", icon: ArchiveIcon, onSelect: () => setDialog("archive") }]),
    {
      label: "Excluir lead",
      icon: Trash2Icon,
      destructive: true,
      onSelect: () => setDialog("delete"),
    },
  ];

  return (
    <>
      <ActionsMenu label="Ações do lead" items={items} />
      <EditLeadSheet
        lead={lead}
        open={dialog === "edit"}
        onOpenChange={(open) => !open && close()}
      />
      <ArchiveLeadDialog
        open={dialog === "archive"}
        onOpenChange={(open) => !open && close()}
        title={`Arquivar ${lead.businessName}?`}
        description="Ele sai da lista e fica em Arquivados, guardando a etapa em que parou. Dá para reativar quando quiser."
        isPending={isChanging}
        onConfirm={(archiveStageId) => {
          changeStage(
            archiveStageId,
            lead.stage,
            `Lead arquivado em ${stages.nameOf(archiveStageId)}.`
          );
          close();
        }}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && close()}
        title={`Excluir ${lead.businessName}?`}
        description="O lead, as notas e as próximas ações serão apagados. Para só tirar da lista, prefira arquivar."
        confirmLabel="Excluir"
        destructive
        isPending={deleteLead.isPending}
        onConfirm={() => deleteLead.mutate()}
      />
    </>
  );
}
