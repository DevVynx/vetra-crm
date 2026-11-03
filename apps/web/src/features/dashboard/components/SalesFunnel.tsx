import { Link } from "@tanstack/react-router";
import type { DashboardPeriod, FunnelStep } from "@vetra/contracts";
import { FunnelIcon, UsersIcon } from "lucide-react";

import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { useStages } from "@/shared/stages/useStages";
import { formatPercent } from "@/shared/utils/format";

import { useDashboardFunnel } from "../queries/useDashboardFunnel";
import { FunnelStream } from "./FunnelStream";

const conversionRate = (count: number, previousCount: number) =>
  previousCount === 0 ? 0 : count / previousCount;

function FunnelLegend({ funnel }: { funnel: FunnelStep[] }) {
  const stages = useStages();
  return (
    <ul className="flex flex-col">
      {funnel.map(({ stage, reachedCount }, index) => {
        const previous = funnel[index - 1];

        return (
          <li key={stage}>
            <Link
              to="/leads"
              className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1 text-sm"
            >
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: stages.colorOf(stage) }}
              />
              <span className="text-muted-foreground">{stages.nameOf(stage)}</span>
              <span className="ml-auto font-medium tabular-nums">{reachedCount}</span>
              <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                {previous && formatPercent(conversionRate(reachedCount, previous.reachedCount))}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SalesFunnel({ period }: { period: DashboardPeriod }) {
  const { data, isPending } = useDashboardFunnel(period);

  if (isPending || !data) {
    return (
      <Section title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
        <SectionSkeleton rows={3} />
      </Section>
    );
  }

  const { funnel } = data;
  const first = funnel[0];

  if (!first?.reachedCount) {
    return (
      <Section title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
        <SectionEmpty icon={UsersIcon} title="Nenhum lead prospectado no período" />
      </Section>
    );
  }

  const last = funnel.at(-1);
  const overallRate = last ? conversionRate(last.reachedCount, first.reachedCount) : undefined;

  return (
    <Section title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
      <FunnelStream funnel={funnel} />

      <FunnelLegend funnel={funnel} />

      {overallRate !== undefined && (
        <p className="text-muted-foreground border-t pt-3 text-xs">
          Conversão de prospectado para fechado:{" "}
          <span className="text-foreground font-medium">{formatPercent(overallRate)}</span>
        </p>
      )}
    </Section>
  );
}
