import type { DashboardPeriod, DashboardSummaryResponse } from "@vetra/contracts";
import {
  BanknoteIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  HourglassIcon,
  RepeatIcon,
  UsersIcon,
} from "lucide-react";

import { type Kpi, KpiCell, KpiGrid } from "@/shared/components/KpiCell";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useStages } from "@/shared/stages/useStages";
import { formatCurrency, pluralize } from "@/shared/utils/format";

import { useDashboardSummary } from "../queries/useDashboardSummary";

function buildKpis(summary: DashboardSummaryResponse, lastStageName: string): Kpi[] {
  const { received, sold, receivable, recurring, activeLeads } = summary;

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
      context: pluralize(sold.customersCount, "cliente", "clientes"),
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
      context: pluralize(recurring.customersCount, "cliente", "clientes"),
    },
    {
      label: "Projetos ativos",
      icon: FolderKanbanIcon,
      accentClassName: "text-chart-5",
      value: String(summary.activeProjectsCount),
      context: "em desenvolvimento",
    },
    {
      label: "Leads ativos",
      icon: UsersIcon,
      accentClassName: "text-chart-6",
      value: String(activeLeads.leadsCount),
      context: `${activeLeads.lastStageLeadsCount} em ${lastStageName}`,
    },
  ];
}

export function KpiStrip({ period }: { period: DashboardPeriod }) {
  const stages = useStages();
  const { data: summary, isPending } = useDashboardSummary(period);

  if (isPending || !summary) {
    return <Skeleton className="h-27 w-full rounded-xl" />;
  }

  return (
    <KpiGrid className="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {buildKpis(summary, stages.lastMiddle.name).map((kpi) => (
        <KpiCell key={kpi.label} {...kpi} />
      ))}
    </KpiGrid>
  );
}
