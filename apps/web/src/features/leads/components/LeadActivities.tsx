import type { LeadDetail } from "@vetra/contracts";
import { isBefore } from "date-fns";
import { CalendarCheckIcon, CircleAlertIcon, ListChecksIcon } from "lucide-react";

import { DefineNextActionButton } from "@/shared/components/next-actions/DefineNextActionButton";
import { NextActionItem } from "@/shared/components/next-actions/NextActionItem";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { useLeadNextActions } from "@/shared/queries/next-actions/useLeadNextActions";
import { useStages } from "@/shared/stages/useStages";
import { startOfTodayInProfileZone } from "@/shared/time-zone/zonedDate";

import { NextActionHighlight } from "./NextActionHighlight";

export function LeadActivities({ lead }: { lead: LeadDetail }) {
  const stages = useStages();
  const { data, isPending } = useLeadNextActions(lead.id);
  const actions = data?.nextActions ?? [];
  const [nextAction, ...laterActions] = actions;
  const todayStart = startOfTodayInProfileZone();

  return (
    <Section
      title="Atividades"
      icon={ListChecksIcon}
      iconClassName="text-warning"
      count={data ? actions.length : undefined}
    >
      {isPending ? (
        <SectionSkeleton rows={1} />
      ) : nextAction ? (
        <div className="flex flex-col gap-4">
          <NextActionHighlight
            action={nextAction}
            isOverdue={isBefore(new Date(nextAction.dueAt), todayStart)}
          />
          {laterActions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Depois
              </p>
              {laterActions.map((action) => (
                <NextActionItem
                  key={action.id}
                  action={action}
                  showLead={false}
                  isOverdue={isBefore(new Date(action.dueAt), todayStart)}
                />
              ))}
            </div>
          )}
        </div>
      ) : stages.isLive(lead.stage) ? (
        <SectionEmpty
          icon={CircleAlertIcon}
          title="Sem próxima ação"
          description="Defina o próximo passo para não perder este lead."
        >
          <DefineNextActionButton lead={lead} />
        </SectionEmpty>
      ) : (
        <SectionEmpty icon={CalendarCheckIcon} title="Nenhuma atividade agendada" />
      )}
    </Section>
  );
}
