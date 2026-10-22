import { Link } from "@tanstack/react-router";
import type { DashboardPeriod, FunnelStep } from "@vetra/contracts";
import { FunnelIcon, UsersIcon } from "lucide-react";
import { Funnel, FunnelChart, LabelList } from "recharts";

import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { funnelStages, leadStageColor, leadStageLabels } from "@/shared/constants/leadStages";
import { formatPercent } from "@/shared/utils/format";

import { useDashboardFunnel } from "../queries/useDashboardFunnel";

const chartConfig: ChartConfig = Object.fromEntries(
  funnelStages.map((stage) => [
    stage,
    { label: leadStageLabels[stage], color: leadStageColor(stage) },
  ])
);

const MIN_BAND_RATIO = 0.15;

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
  // Band widths are proportional, but with a floor so an empty stage still shows its band
  // and count; the label and tooltip always show the real number.
  const minBandWidth = first.reachedCount * MIN_BAND_RATIO;
  const chartData = funnel.map((step) => ({
    ...step,
    bandWidth: Math.max(step.reachedCount, minBandWidth),
    fill: `var(--color-${step.stage})`,
  }));

  return (
    <Section title="Funil de vendas" icon={FunnelIcon} iconClassName="text-chart-1">
      <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
        <FunnelChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="stage"
                hideLabel
                formatter={(_, __, item) => {
                  const step = item.payload as FunnelStep;
                  return (
                    <div className="flex w-full items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: leadStageColor(step.stage) }}
                      />
                      <span className="text-muted-foreground">{leadStageLabels[step.stage]}</span>
                      <span className="text-foreground ml-auto font-medium tabular-nums">
                        {step.reachedCount}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <Funnel data={chartData} dataKey="bandWidth" nameKey="stage" lastShapeType="rectangle">
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
    </Section>
  );
}
