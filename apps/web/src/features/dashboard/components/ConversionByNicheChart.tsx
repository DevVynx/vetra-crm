import type { DashboardPeriod } from "@vetra/contracts";
import { PercentIcon } from "lucide-react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { Section } from "@/shared/components/Section";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { cn } from "@/shared/utils/cn";
import { formatPercent } from "@/shared/utils/format";

import { useConversionByNiche } from "../queries/useConversionByNiche";
import { TooltipRow } from "./TooltipRow";

const chartConfig = {
  conversionRatio: { label: "Conversão", color: "var(--chart-1)" },
} satisfies ChartConfig;

const OTHERS_LABEL = "Outros";
const MAX_ROWS_PER_COLUMN = 6;
const ROW_HEIGHT = 40;

type NicheCounts = { niche: string; prospectedCount: number; wonCount: number };

const withRatio = (item: NicheCounts) => ({
  ...item,
  conversionRatio: item.wonCount / item.prospectedCount,
});

type NicheRow = ReturnType<typeof withRatio>;

function NicheBars({ rows, fixedHeight }: { rows: NicheRow[]; fixedHeight: boolean }) {
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto w-full", !fixedHeight && "min-h-60 flex-1")}
      style={fixedHeight ? { height: rows.length * ROW_HEIGHT } : undefined}
    >
      <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 44 }}>
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis
          type="category"
          dataKey="niche"
          tickLine={false}
          axisLine={false}
          width={96}
          interval={0}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={
            <ChartTooltipContent
              className="min-w-48"
              labelFormatter={(_, payload) => payload[0]?.payload?.niche ?? ""}
              formatter={(value, _, item) => (
                <div className="flex w-full flex-col gap-1">
                  <TooltipRow
                    label={chartConfig.conversionRatio.label}
                    color={chartConfig.conversionRatio.color}
                    value={formatPercent(Number(value))}
                  />
                  <TooltipRow
                    label="Fechados"
                    value={`${item.payload.wonCount} de ${item.payload.prospectedCount}`}
                  />
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="conversionRatio"
          fill="var(--color-conversionRatio)"
          barSize={20}
          minPointSize={3}
          radius={[0, 4, 4, 0]}
        >
          <LabelList
            dataKey="conversionRatio"
            position="right"
            offset={8}
            className="fill-foreground text-xs tabular-nums"
            formatter={(value: unknown) => (typeof value === "number" ? formatPercent(value) : "")}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function ConversionByNicheChart({ period }: { period: DashboardPeriod }) {
  const { data, isPending } = useConversionByNiche(period);
  const sectionProps = {
    title: "Conversão por nicho",
    icon: PercentIcon,
    iconClassName: "text-chart-1",
  };

  if (isPending || !data) {
    return (
      <Section {...sectionProps}>
        <SectionSkeleton rows={4} />
      </Section>
    );
  }

  if (data.niches.length === 0) {
    return (
      <Section {...sectionProps}>
        <SectionEmpty icon={PercentIcon} title="Nenhum lead prospectado no período" />
      </Section>
    );
  }

  const rows = [
    ...data.niches.map(withRatio).sort((a, b) => b.conversionRatio - a.conversionRatio),
    ...(data.others ? [withRatio({ niche: OTHERS_LABEL, ...data.others })] : []),
  ];

  if (rows.length <= MAX_ROWS_PER_COLUMN) {
    return (
      <Section {...sectionProps}>
        <NicheBars rows={rows} fixedHeight={false} />
      </Section>
    );
  }

  return (
    <Section {...sectionProps}>
      <div className="grid grid-cols-2 items-start gap-x-4">
        <NicheBars rows={rows.slice(0, MAX_ROWS_PER_COLUMN)} fixedHeight />
        <NicheBars rows={rows.slice(MAX_ROWS_PER_COLUMN)} fixedHeight />
      </div>
    </Section>
  );
}
