import type { DashboardPeriod, ProspectingGranularity } from "@vetra/contracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TargetIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

import { useDashboardProspecting } from "../queries/useDashboardProspecting";
import { DashboardSection } from "./DashboardSection";
import { SectionSkeleton } from "./SectionSkeleton";
import { TooltipRow } from "./TooltipRow";

const chartConfig = {
  prospectedCount: { label: "Prospectados", color: "var(--chart-4)" },
  wonCount: { label: "Fechados", color: "var(--chart-2)" },
} satisfies ChartConfig;

const bucketFormats: Record<ProspectingGranularity, { tick: string; tooltip: string }> = {
  day: { tick: "EEE", tooltip: "EEEE, d 'de' MMMM" },
  week: { tick: "d MMM", tooltip: "'Semana de' d 'de' MMMM" },
  month: { tick: "MMM", tooltip: "MMMM 'de' yyyy" },
};

const formatBucket = (iso: unknown, pattern: string) =>
  typeof iso === "string" ? format(new Date(iso), pattern, { locale: ptBR }) : "";

export function ProspectingChart({ period }: { period: DashboardPeriod }) {
  const { data, isPending } = useDashboardProspecting(period);
  const sectionProps = {
    title: "Prospecção",
    icon: TargetIcon,
    iconClassName: "text-chart-4",
  };

  if (isPending || !data) {
    return (
      <DashboardSection {...sectionProps}>
        <SectionSkeleton rows={4} />
      </DashboardSection>
    );
  }

  const formats = bucketFormats[data.granularity];

  return (
    <DashboardSection {...sectionProps}>
      <ChartContainer config={chartConfig} className="aspect-auto min-h-60 w-full flex-1">
        <BarChart data={data.points} margin={{ left: 4, right: 8, top: 8 }} maxBarSize={20}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="bucketStart"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval={0}
            tickFormatter={(value) => formatBucket(value, formats.tick)}
          />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={
              <ChartTooltipContent
                className="min-w-48"
                labelFormatter={(_, payload) =>
                  formatBucket(payload[0]?.payload?.bucketStart, formats.tooltip)
                }
                formatter={(value, name) => {
                  const config =
                    name === "prospectedCount" ? chartConfig.prospectedCount : chartConfig.wonCount;
                  return (
                    <TooltipRow label={config.label} color={config.color} value={String(value)} />
                  );
                }}
              />
            }
          />
          <Bar
            dataKey="prospectedCount"
            fill="var(--color-prospectedCount)"
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="wonCount" fill="var(--color-wonCount)" radius={[4, 4, 0, 0]} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      </ChartContainer>
    </DashboardSection>
  );
}
