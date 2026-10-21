import type { DashboardPeriod, RevenueGranularity } from "@vetra/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartAreaIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useElementWidth } from "@/shared/hooks/useElementWidth";
import { formatCompactCurrency, formatCurrency } from "@/shared/utils/format";

import { useDashboardRevenue } from "../queries/useDashboardRevenue";
import { DashboardSection } from "./DashboardSection";
import { SectionSkeleton } from "./SectionSkeleton";
import { TooltipRow } from "./TooltipRow";

const chartConfig = {
  soldInCents: { label: "Vendido", color: "var(--chart-1)" },
  receivedInCents: { label: "Recebido", color: "var(--chart-2)" },
} satisfies ChartConfig;

const series = ["soldInCents", "receivedInCents"] as const;

const Y_AXIS_WIDTH = 64;
const CHART_MARGIN = { left: 4, right: 24, top: 8 };

// minTickSpacing is roughly the widest label plus breathing room, in pixels.
const bucketFormats: Record<
  RevenueGranularity,
  { tick: string; tooltip: string; minTickSpacing: number }
> = {
  day: { tick: "d MMM", tooltip: "EEEE, d 'de' MMMM", minTickSpacing: 56 },
  month: { tick: "MMM", tooltip: "MMMM 'de' yyyy", minTickSpacing: 40 },
};

// Recharts' own tick thinning skips labels unevenly; a fixed step keeps the gaps equal.
function evenlySpacedTicks(buckets: string[], plotWidth: number, minSpacing: number) {
  if (plotWidth <= 0) return buckets;
  const maxTicks = Math.max(2, Math.floor(plotWidth / minSpacing));
  const step = Math.ceil(buckets.length / maxTicks);
  return buckets.filter((_, index) => index % step === 0);
}

const formatBucket = (iso: unknown, pattern: string) =>
  typeof iso === "string" ? format(new Date(iso), pattern, { locale: ptBR }) : "";

export function RevenueChart({ period }: { period: DashboardPeriod }) {
  const { data, isPending } = useDashboardRevenue(period);
  const { ref: chartRef, width: chartWidth } = useElementWidth<HTMLDivElement>();
  const sectionProps = {
    title: "Recebido × Vendido",
    icon: ChartAreaIcon,
    iconClassName: "text-chart-2",
  };

  if (isPending || !data) {
    return (
      <DashboardSection {...sectionProps}>
        <SectionSkeleton rows={4} />
      </DashboardSection>
    );
  }

  const formats = bucketFormats[data.granularity];
  const plotWidth = chartWidth - Y_AXIS_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
  const ticks = evenlySpacedTicks(
    data.points.map((point) => point.bucketStart),
    plotWidth,
    formats.minTickSpacing
  );

  return (
    <DashboardSection {...sectionProps}>
      <ChartContainer
        ref={chartRef}
        config={chartConfig}
        className="aspect-auto min-h-72 w-full flex-1"
      >
        <AreaChart data={data.points} margin={CHART_MARGIN}>
          <defs>
            {series.map((key) => (
              <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`var(--color-${key})`} stopOpacity={0.25} />
                <stop offset="100%" stopColor={`var(--color-${key})`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="bucketStart"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            ticks={ticks}
            interval={0}
            tickFormatter={(value) => formatBucket(value, formats.tick)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={Y_AXIS_WIDTH}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                className="min-w-48"
                labelFormatter={(_, payload) =>
                  formatBucket(payload[0]?.payload?.bucketStart, formats.tooltip)
                }
                formatter={(value, name) => {
                  const config =
                    name === "soldInCents" ? chartConfig.soldInCents : chartConfig.receivedInCents;
                  return (
                    <TooltipRow
                      label={config.label}
                      color={config.color}
                      value={formatCurrency(Number(value))}
                    />
                  );
                }}
              />
            }
          />
          {series.map((key) => (
            <Area
              key={key}
              dataKey={key}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              fill={`url(#fill-${key})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </DashboardSection>
  );
}
