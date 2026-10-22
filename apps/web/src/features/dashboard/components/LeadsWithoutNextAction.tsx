import { Link } from "@tanstack/react-router";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { DefineNextActionPopover } from "@/shared/components/next-actions/DefineNextActionPopover";
import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/components/ui/item";

import { useLeadsWithoutNextAction } from "../queries/useLeadsWithoutNextAction";

export function LeadsWithoutNextAction() {
  const { data, isPending } = useLeadsWithoutNextAction();
  const leads = data?.leads ?? [];

  return (
    <Section
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
                <ItemTitle>
                  <Link
                    to="/leads/$leadId"
                    params={{ leadId: lead.id }}
                    className="hover:underline"
                  >
                    {lead.businessName}
                  </Link>
                </ItemTitle>
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
    </Section>
  );
}
