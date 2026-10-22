import type { LeadDetail } from "@vetra/contracts";
import { isBefore, startOfToday } from "date-fns";
import { CalendarCheckIcon, CircleAlertIcon, ListChecksIcon } from "lucide-react";

import { DefineNextActionPopover } from "@/shared/components/next-actions/DefineNextActionPopover";
import { NextActionItem } from "@/shared/components/next-actions/NextActionItem";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";

import { isLiveStage } from "../constants/leadFilters";
import { useLeadNextActions } from "../queries/useLeadNextActions";

export function LeadActivities({ lead }: { lead: LeadDetail }) {
  const { data, isPending } = useLeadNextActions(lead.id);
  const actions = data?.nextActions ?? [];
  const todayStart = startOfToday();

  return (
    <Section
      title="Atividades"
      icon={ListChecksIcon}
      iconClassName="text-warning"
      count={data ? actions.length : undefined}
    >
      {isPending ? (
        <SectionSkeleton rows={1} />
      ) : actions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <NextActionItem
              key={action.id}
              action={action}
              showLead={false}
              isOverdue={isBefore(new Date(action.dueAt), todayStart)}
            />
          ))}
        </div>
      ) : isLiveStage(lead.stage) ? (
        <SectionEmpty
          icon={CircleAlertIcon}
          title="Sem próxima ação"
          description="Defina o próximo passo para não perder este lead."
        >
          <DefineNextActionPopover lead={lead} />
        </SectionEmpty>
      ) : (
        <SectionEmpty icon={CalendarCheckIcon} title="Nenhuma atividade agendada" />
      )}
    </Section>
  );
}
