import type { CustomerDetail } from "@vetra/contracts";
import { PencilIcon, PlusIcon, WalletIcon } from "lucide-react";
import { useState } from "react";

import { Property, PropertyList } from "@/shared/components/detail/PropertyList";
import { Section } from "@/shared/components/Section";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency, formatPercent } from "@/shared/utils/format";

import { MonthlyFeeSheet } from "./MonthlyFeeSheet";

type BillingCardProps = {
  customerId: string;
  billing: CustomerDetail["billing"];
};

export function BillingCard({ customerId, billing }: BillingCardProps) {
  const [isEditingFee, setIsEditingFee] = useState(false);
  const ratio = billing.totalInCents === 0 ? 0 : billing.receivedInCents / billing.totalInCents;
  const remaining = billing.totalInCents - billing.receivedInCents;

  return (
    <Section
      title="Faturamento"
      icon={WalletIcon}
      iconClassName="text-success"
      action={
        <Button size="sm" variant="outline" onClick={() => setIsEditingFee(true)}>
          {billing.monthlyFeeInCents ? <PencilIcon /> : <PlusIcon />}
          Mensalidade
        </Button>
      }
    >
      <PropertyList>
        <Property label="Recebido" className="tabular-nums">
          {formatCurrency(billing.receivedInCents)}
          <span className="text-muted-foreground"> / {formatCurrency(billing.totalInCents)}</span>
        </Property>
        <Property label="Progresso">
          <div className="flex items-center gap-2">
            <div className="bg-muted h-1.5 w-full max-w-24 overflow-hidden rounded-full">
              <div
                className="bg-success h-full rounded-full"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span className="tabular-nums">{formatPercent(ratio)}</span>
          </div>
        </Property>
        <Property label="Restante" className="tabular-nums">
          {formatCurrency(remaining)}
        </Property>
        <Property label="Mensalidade" className="tabular-nums">
          {billing.monthlyFeeInCents ? (
            <>
              {formatCurrency(billing.monthlyFeeInCents)}
              <span className="text-muted-foreground text-xs">/mês</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sem mensalidade</span>
          )}
        </Property>
      </PropertyList>
      <MonthlyFeeSheet
        customerId={customerId}
        monthlyFeeInCents={billing.monthlyFeeInCents}
        open={isEditingFee}
        onOpenChange={setIsEditingFee}
      />
    </Section>
  );
}
