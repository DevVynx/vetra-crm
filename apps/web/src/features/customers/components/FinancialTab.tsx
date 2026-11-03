import type { CustomerDetail } from "@vetra/contracts";
import {
  CircleCheckIcon,
  HourglassIcon,
  ReceiptTextIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";

import { ActiveFilters } from "@/shared/components/filters/ActiveFilters";
import type { FilterController } from "@/shared/components/filters/useFilterController";
import { KpiCell } from "@/shared/components/KpiCell";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/utils/format";

import { useCustomerLedger } from "../queries/useCustomerLedger";
import { LedgerRow } from "./LedgerRow";

function MetricCard({ children }: { children: React.ReactNode }) {
  return <div className="flex overflow-hidden rounded-xl border *:flex-1">{children}</div>;
}

function FinancialSummary({ financial }: { financial: CustomerDetail["financial"] }) {
  const { balanceInCents } = financial;
  const isNegative = balanceInCents < 0;

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-2 @xl:grid-cols-3 @3xl:grid-cols-5">
        <MetricCard>
          <KpiCell
            compact
            label="Saldo"
            icon={WalletIcon}
            accentClassName={isNegative ? "text-destructive" : "text-success"}
            value={`${isNegative ? "−" : "+"} ${formatCurrency(Math.abs(balanceInCents))}`}
            valueClassName={isNegative ? "text-destructive" : "text-success"}
          />
        </MetricCard>
        <MetricCard>
          <KpiCell
            compact
            label="Receita confirmada"
            icon={CircleCheckIcon}
            accentClassName="text-info"
            value={formatCurrency(financial.confirmedRevenueInCents)}
          />
        </MetricCard>
        <MetricCard>
          <KpiCell
            compact
            label="Receita pendente"
            icon={HourglassIcon}
            accentClassName="text-warning"
            value={formatCurrency(financial.pendingRevenueInCents)}
          />
        </MetricCard>
        <MetricCard>
          <KpiCell
            compact
            label="Despesa confirmada"
            icon={TrendingDownIcon}
            accentClassName="text-destructive"
            value={formatCurrency(financial.confirmedExpenseInCents)}
          />
        </MetricCard>
        <MetricCard>
          <KpiCell
            compact
            label="Despesa pendente"
            icon={HourglassIcon}
            accentClassName="text-destructive"
            value={formatCurrency(financial.pendingExpenseInCents)}
          />
        </MetricCard>
      </div>
    </div>
  );
}

type FinancialTabProps = {
  customer: CustomerDetail;
  filtering: FilterController;
};

export function FinancialTab({ customer, filtering }: FinancialTabProps) {
  const { data, isPending } = useCustomerLedger(customer.id, filtering.value);
  const entries = data?.entries ?? [];
  const hasFilters = filtering.value.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <FinancialSummary financial={customer.financial} />
      <ActiveFilters controller={filtering} />
      {isPending ? (
        <SectionSkeleton rows={3} />
      ) : entries.length === 0 ? (
        <SectionEmpty
          icon={ReceiptTextIcon}
          title={hasFilters ? "Nenhum lançamento encontrado" : "Nenhum lançamento"}
          description={hasFilters ? "Tente outros filtros ou limpe-os." : undefined}
        >
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={filtering.clear}>
              Limpar filtros
            </Button>
          )}
        </SectionEmpty>
      ) : (
        <ul className="bg-card @container rounded-xl border py-2">
          {entries.map((entry) => (
            <LedgerRow key={entry.id} customerId={customer.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}
