import type { CustomerDetail } from "@vetra/contracts";
import {
  CircleCheckIcon,
  HourglassIcon,
  ReceiptTextIcon,
  TrendingDownIcon,
  WalletIcon,
} from "lucide-react";

import { KpiCell } from "@/shared/components/KpiCell";
import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
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

export function FinancialTab({ customer }: { customer: CustomerDetail }) {
  const { data, isPending } = useCustomerLedger(customer.id);
  const entries = data?.entries ?? [];

  return (
    <div className="flex flex-col gap-4">
      <FinancialSummary financial={customer.financial} />
      {isPending ? (
        <SectionSkeleton rows={3} />
      ) : entries.length === 0 ? (
        <SectionEmpty icon={ReceiptTextIcon} title="Nenhum lançamento" />
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
