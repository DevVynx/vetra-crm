import type { DashboardPeriod, DashboardSummaryResponse } from "@vetra/contracts";
import {
  BanknoteIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  HourglassIcon,
  type LucideIcon,
  MessagesSquareIcon,
  RepeatIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { formatCurrency, formatSignedPercent, pluralize } from "@/shared/utils/format";

import { useDashboardSummary } from "../queries/useDashboardSummary";

type Kpi = {
  label: string;
  icon: LucideIcon;
  accentClassName: string;
  value: string;
  valueSuffix?: string;
  context: string;
  changeRatio?: number | null;
};

function buildKpis(summary: DashboardSummaryResponse): Kpi[] {
  const { received, sold, receivable, recurring, negotiating } = summary;

  return [
    {
      label: "Recebido",
      icon: BanknoteIcon,
      accentClassName: "text-chart-2",
      value: formatCurrency(received.amountInCents),
      context: pluralize(received.paymentsCount, "pagamento", "pagamentos"),
      changeRatio: received.changeRatio,
    },
    {
      label: "Vendido",
      icon: HandshakeIcon,
      accentClassName: "text-chart-1",
      value: formatCurrency(sold.amountInCents),
      context: pluralize(sold.clientsCount, "cliente", "clientes"),
      changeRatio: sold.changeRatio,
    },
    {
      label: "A receber",
      icon: HourglassIcon,
      accentClassName: "text-chart-3",
      value: formatCurrency(receivable.amountInCents),
      context: pluralize(
        receivable.pendingInstallmentsCount,
        "parcela pendente",
        "parcelas pendentes"
      ),
    },
    {
      label: "Recorrente",
      icon: RepeatIcon,
      accentClassName: "text-chart-4",
      value: formatCurrency(recurring.monthlyAmountInCents),
      valueSuffix: "/mês",
      context: pluralize(recurring.clientsCount, "cliente", "clientes"),
    },
    {
      label: "Projetos ativos",
      icon: FolderKanbanIcon,
      accentClassName: "text-chart-5",
      value: String(summary.activeProjectsCount),
      context: "em produção",
    },
    {
      label: "Em negociação",
      icon: MessagesSquareIcon,
      accentClassName: "text-chart-6",
      value: String(negotiating.leadsCount),
      context: `${negotiating.proposalsCount} com proposta`,
    },
  ];
}

function ChangeBadge({ ratio }: { ratio: number }) {
  const Icon = ratio < 0 ? TrendingDownIcon : TrendingUpIcon;

  return (
    <span
      title="Comparado ao período anterior"
      className={cn(
        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        ratio > 0 && "bg-success/10 text-success",
        ratio < 0 && "bg-destructive/10 text-destructive",
        ratio === 0 && "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {formatSignedPercent(ratio)}
    </span>
  );
}

function KpiCell({
  label,
  icon: Icon,
  accentClassName,
  value,
  valueSuffix,
  context,
  changeRatio,
}: Kpi) {
  return (
    <div className="bg-card flex flex-col gap-2 p-4">
      <div className="flex min-h-5 items-center justify-between gap-2">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", accentClassName)}>
          <Icon className="size-3.5" />
          {label}
        </div>
        {changeRatio != null && <ChangeBadge ratio={changeRatio} />}
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
        {valueSuffix && (
          <span className="text-muted-foreground text-sm font-normal">{valueSuffix}</span>
        )}
      </p>
      <p className="text-muted-foreground text-xs">{context}</p>
    </div>
  );
}

export function KpiStrip({ period }: { period: DashboardPeriod }) {
  const { data: summary, isPending } = useDashboardSummary(period);

  if (isPending || !summary) {
    return <Skeleton className="h-27 w-full rounded-xl" />;
  }

  return (
    <div className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border md:grid-cols-3 xl:grid-cols-6">
      {buildKpis(summary).map((kpi) => (
        <KpiCell key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
