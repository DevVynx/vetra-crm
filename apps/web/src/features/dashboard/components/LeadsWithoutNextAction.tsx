import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, CircleAlertIcon, CircleCheckIcon } from "lucide-react";

import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { DefineNextActionButton } from "@/shared/components/next-actions/DefineNextActionButton";
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
      count={data?.total}
    >
      {isPending ? (
        <SectionSkeleton rows={2} />
      ) : leads.length === 0 ? (
        <SectionEmpty
          icon={CircleCheckIcon}
          title="Todos os leads têm um próximo passo"
          description="Os que ficarem sem ação aparecem aqui."
        />
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
                <DefineNextActionButton lead={lead} />
              </ItemActions>
            </Item>
          ))}
          {data && data.total > leads.length && (
            <Link
              to="/leads"
              search={{ filters: [{ field: "next_action", operator: "is", values: [false] }] }}
              className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1 text-xs font-medium"
            >
              Ver todos os {data.total}
              <ArrowRightIcon className="size-3.5" />
            </Link>
          )}
        </div>
      )}
    </Section>
  );
}
