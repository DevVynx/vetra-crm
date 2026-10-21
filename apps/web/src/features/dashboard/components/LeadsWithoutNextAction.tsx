import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";

import { useLeadsWithoutNextAction } from "../queries/useLeadsWithoutNextAction";
import { DashboardSection } from "./DashboardSection";
import { DefineNextActionPopover } from "./DefineNextActionPopover";
import { LeadStageBadge } from "./LeadStageBadge";
import { SectionEmpty } from "./SectionEmpty";
import { SectionSkeleton } from "./SectionSkeleton";

export function LeadsWithoutNextAction() {
  const { data, isPending } = useLeadsWithoutNextAction();
  const leads = data?.leads ?? [];

  return (
    <DashboardSection
      title="Sem próxima ação"
      icon={CircleAlertIcon}
      iconClassName="text-warning"
      count={data ? leads.length : undefined}
    >
      {isPending ? (
        <SectionSkeleton rows={2} />
      ) : leads.length === 0 ? (
        <SectionEmpty icon={CircleCheckIcon} title="Todos os leads têm um próximo passo" />
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((lead) => (
            <Item key={lead.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>{lead.businessName}</ItemTitle>
                <ItemDescription>
                  <LeadStageBadge stage={lead.stage} /> · {lead.city}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <DefineNextActionPopover lead={lead} />
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
