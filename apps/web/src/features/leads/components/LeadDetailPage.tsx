import { getRouteApi, Navigate } from "@tanstack/react-router";
import { PlusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";

import { ContactCard } from "@/shared/components/detail/ContactCard";
import { DetailDates } from "@/shared/components/detail/DetailDates";
import { DetailIdentity } from "@/shared/components/detail/DetailIdentity";
import { DetailPanelTrigger } from "@/shared/components/detail/DetailPanelTrigger";
import { DetailNotFound, DetailSkeleton } from "@/shared/components/detail/DetailStates";
import { SplitDetailLayout } from "@/shared/components/detail/SplitDetailLayout";
import { WhatsAppButton } from "@/shared/components/detail/WhatsAppButton";
import { DoNotContactBadge } from "@/shared/components/DoNotContactBadge";
import { usePageCrumb } from "@/shared/components/layout/PageCrumb";
import { NewActivitySheet } from "@/shared/components/next-actions/NewActivitySheet";
import { Button } from "@/shared/components/ui/button";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useLead } from "@/shared/queries/leads/useLead";
import { useStages } from "@/shared/stages/useStages";
import { formatLastContact } from "@/shared/utils/date";

import { useLeadConversation } from "../queries/useLeadConversation";
import { conversationStateOf } from "../utils/conversationState";
import { LeadActionsMenu } from "./LeadActionsMenu";
import { LeadActivities } from "./LeadActivities";
import { LeadConversation } from "./LeadConversation";
import { LeadNotes } from "./LeadNotes";
import { LeadStageStepper } from "./LeadStageStepper";

const route = getRouteApi("/_app/leads/$leadId");

export function LeadDetailPage() {
  const { leadId } = route.useParams();
  const stages = useStages();
  const { data: lead, isPending } = useLead(leadId);
  const { data: conversationData, isPending: isConversationPending } = useLeadConversation(leadId);
  usePageCrumb(lead?.businessName);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  useHotkey(
    "n",
    () => setIsAddingActivity(true),
    Boolean(lead) && lead !== undefined && !stages.isClosing(lead.stage)
  );

  if (isPending || isConversationPending) return <DetailSkeleton />;

  if (!lead) {
    return (
      <DetailNotFound
        icon={UsersIcon}
        title="Lead não encontrado"
        backTo="/leads"
        backLabel="Voltar para Leads"
      />
    );
  }

  if (stages.isClosing(lead.stage)) {
    return <Navigate to="/customers/$customerId" params={{ customerId: lead.id }} replace />;
  }

  const conversation = conversationData?.conversation;
  const conversationState = conversation ? conversationStateOf(conversation) : null;
  const contactStatus =
    conversationState?.statusText ??
    (lead.lastContactAt
      ? `Último contato ${formatLastContact(new Date(lead.lastContactAt))}`
      : "Sem contato ainda");

  return (
    <SplitDetailLayout
      storageKey="lead-detail-panel-open"
      aside={
        <>
          <DetailIdentity
            kind="Lead"
            name={lead.businessName}
            contactName={lead.contactName}
            photoUrl={lead.photoUrl}
            status={
              <>
                {stages.nameOf(lead.stage)} {formatLastContact(new Date(lead.stageChangedAt))}
                {" · "}
                {contactStatus}
                {lead.doNotContact && (
                  <>
                    {" · "}
                    <DoNotContactBadge />
                  </>
                )}
              </>
            }
            actions={<LeadActionsMenu lead={lead} />}
          />
          <ContactCard lead={lead} title="Informações" />
          <LeadNotes leadId={lead.id} />
        </>
      }
      footer={
        <DetailDates
          className="border-t-0 pt-0"
          rows={[
            { kind: "created", date: lead.createdAt },
            { kind: "updated", date: lead.updatedAt },
          ]}
        />
      }
    >
      <div className="-mb-2 flex items-center gap-2">
        <DetailPanelTrigger label="dados do lead" />
        <div className="ml-auto flex gap-2">
          <WhatsAppButton leadId={lead.id} />
          <Button
            className="font-semibold"
            title="Nova atividade (N)"
            onClick={() => setIsAddingActivity(true)}
          >
            <PlusIcon />
            Nova atividade
          </Button>
        </div>
      </div>
      <NewActivitySheet
        leadId={lead.id}
        businessName={lead.businessName}
        open={isAddingActivity}
        onOpenChange={setIsAddingActivity}
      />
      <LeadStageStepper lead={lead} />
      <LeadActivities lead={lead} />
      <LeadConversation leadId={lead.id} />
    </SplitDetailLayout>
  );
}
