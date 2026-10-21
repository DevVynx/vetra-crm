import { Link } from "@tanstack/react-router";
import type { FunnelStep } from "@vetra/contracts";
import { FunnelIcon } from "lucide-react";
import { Funnel, FunnelChart, LabelList } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatPercent } from "@/shared/utils/format";

import { funnelStages, leadStageColor, leadStageLabels } from "../constants/leadStages";
import { useDashboardFunnel } from "../queries/useDashboardFunnel";
import { DashboardSection } from "./DashboardSection";
import { SectionSkeleton } from "./SectionSkeleton";

const chartConfig: ChartConfig = Object.fromEntries(
  funnelStages.map((stage) => [
    stage,
    { label: leadStageLabels[stage], color: leadStageColor(stage) },
  ])
);

const conversionRate = (count: number, previousCount: number) =>
  previousCount === 0 ? 0 : count / previousCount;

function FunnelLegend({ funnel }: { funnel: FunnelStep[] }) {
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
                style={{ backgroundColor: leadStageColor(stage) }}
              />
              <span className="text-muted-foreground">{leadStageLabels[stage]}</span>
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

export function SalesFunnel() {
  const { data, isPending } = useDashboardFunnel();

  if (isPending || !data) {
    return (
      <DashboardSection title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
        <SectionSkeleton rows={3} />
      </DashboardSection>
    );
  }

  const { funnel } = data;
  const first = funnel[0];
  const last = funnel.at(-1);
  const overallRate =
    first && last ? conversionRate(last.reachedCount, first.reachedCount) : undefined;
  const chartData = funnel.map((step) => ({ ...step, fill: `var(--color-${step.stage})` }));

  return (
    <DashboardSection title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
      <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
        <FunnelChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="stage" hideLabel />} />
          <Funnel data={chartData} dataKey="reachedCount" nameKey="stage" lastShapeType="rectangle">
            <LabelList
              dataKey="reachedCount"
              position="center"
              stroke="none"
              className="fill-background text-xs font-semibold"
            />
          </Funnel>
        </FunnelChart>
      </ChartContainer>

      <FunnelLegend funnel={funnel} />

      {overallRate !== undefined && (
        <p className="text-muted-foreground border-t pt-3 text-xs">
          Conversão de prospectado para fechado:{" "}
          <span className="text-foreground font-medium">{formatPercent(overallRate)}</span>
        </p>
      )}
    </DashboardSection>
  );
}
