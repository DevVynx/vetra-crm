import { getRouteApi, Navigate } from "@tanstack/react-router";
import { PlusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";

import { ContactCard } from "@/shared/components/detail/ContactCard";
import { DetailDates } from "@/shared/components/detail/DetailDates";
import { DetailIdentity } from "@/shared/components/detail/DetailIdentity";
import { DetailPanelTrigger } from "@/shared/components/detail/DetailPanelTrigger";
import { DetailNotFound, DetailSkeleton } from "@/shared/components/detail/DetailStates";
import { SplitDetailLayout } from "@/shared/components/detail/SplitDetailLayout";
import { usePageCrumb } from "@/shared/components/layout/PageCrumb";
import { Button } from "@/shared/components/ui/button";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useLead } from "@/shared/queries/leads/useLead";

import { LeadActionsMenu } from "./LeadActionsMenu";
import { LeadActivities } from "./LeadActivities";
import { LeadNotes } from "./LeadNotes";
import { LeadStageStepper } from "./LeadStageStepper";
import { NewActivitySheet } from "./NewActivitySheet";

const route = getRouteApi("/_app/leads/$leadId");

export function LeadDetailPage() {
  const { leadId } = route.useParams();
  const { data: lead, isPending } = useLead(leadId);
  usePageCrumb(lead?.businessName);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  useHotkey("n", () => setIsAddingActivity(true), Boolean(lead) && lead?.stage !== "won");

  if (isPending) return <DetailSkeleton />;

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

  if (lead.stage === "won") {
    return <Navigate to="/customers/$customerId" params={{ customerId: lead.id }} replace />;
  }

  return (
    <SplitDetailLayout
      storageKey="lead-detail-panel-open"
      aside={
        <>
          <DetailIdentity
            kind="Lead"
            name={lead.businessName}
            contactName={lead.contactName}
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
        <Button className="ml-auto font-semibold" title="Nova atividade (N)" onClick={() => setIsAddingActivity(true)}>
          <PlusIcon />
          Nova atividade
        </Button>
      </div>
      <NewActivitySheet
        leadId={lead.id}
        businessName={lead.businessName}
        open={isAddingActivity}
        onOpenChange={setIsAddingActivity}
      />
      <LeadStageStepper lead={lead} />
      <LeadActivities lead={lead} />
    </SplitDetailLayout>
  );
}
