import { v7 as uuidv7 } from "uuid";

import { InvalidDealPaymentError } from "./errors";

export type Deal = {
  id: string;
  leadId: string;
  closedAt: Date;
  closedValueInCents: number;
  document: string | null;
  monthlyFeeInCents: number | null;
};

export type Installment = {
  id: string;
  leadId: string;
  projectId: string | null;
  description: string;
  amountInCents: number;
  dueAt: Date;
  paidAt: Date | null;
};

export type DealPayment = {
  closedValueInCents: number;
  receivedInCents: number;
  installmentsCount: number;
  firstInstallmentDueAt: Date | null;
};

// Same calendar day of the following months in UTC; short months clamp to their last day.
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

function ensureValidPayment(payment: DealPayment): void {
  const remaining = payment.closedValueInCents - payment.receivedInCents;
  if (payment.closedValueInCents <= 0 || payment.receivedInCents < 0 || remaining < 0) {
    throw new InvalidDealPaymentError();
  }
  if (remaining > 0 && payment.installmentsCount > 0 && !payment.firstInstallmentDueAt) {
    throw new InvalidDealPaymentError();
  }
}

const installment = (
  leadId: string,
  description: string,
  amountInCents: number,
  dueAt: Date,
  paidAt: Date | null
): Installment => ({
  id: uuidv7(),
  leadId,
  projectId: null,
  description,
  amountInCents,
  dueAt,
  paidAt,
});

// What was received at closing is one paid entry; the rest is split monthly, the rounding
// remainder going to the last installment. With no installments the rest stays unscheduled.
function open(
  leadId: string,
  document: string | null,
  payment: DealPayment,
  now: Date
): { deal: Deal; installments: Installment[] } {
  ensureValidPayment(payment);
  const { closedValueInCents, receivedInCents, installmentsCount, firstInstallmentDueAt } = payment;
  const remaining = closedValueInCents - receivedInCents;
  const installments: Installment[] = [];

  if (receivedInCents > 0) {
    const description = remaining > 0 ? "Entrada" : "Pagamento à vista";
    installments.push(installment(leadId, description, receivedInCents, now, now));
  }

  if (remaining > 0 && installmentsCount > 0 && firstInstallmentDueAt) {
    const base = Math.floor(remaining / installmentsCount);
    for (let index = 0; index < installmentsCount; index++) {
      const isLast = index === installmentsCount - 1;
      installments.push(
        installment(
          leadId,
          `Parcela ${index + 1} de ${installmentsCount}`,
          isLast ? remaining - base * (installmentsCount - 1) : base,
          addMonths(firstInstallmentDueAt, index),
          null
        )
      );
    }
  }

  const deal: Deal = {
    id: uuidv7(),
    leadId,
    closedAt: now,
    closedValueInCents,
    document,
    monthlyFeeInCents: null,
  };
  return { deal, installments };
}

export type Billing = {
  receivedInCents: number;
  totalInCents: number;
};

// The closed value counts as billed even while part of it has no installments yet.
function billingOf(
  deal: Pick<Deal, "closedValueInCents">,
  installmentsTotalInCents: number,
  receivedInCents: number
): Billing {
  return {
    receivedInCents,
    totalInCents: Math.max(deal.closedValueInCents, installmentsTotalInCents),
  };
}

export type CustomerFinancial = {
  confirmedRevenueInCents: number;
  pendingRevenueInCents: number;
  confirmedExpenseInCents: number;
  pendingExpenseInCents: number;
  balanceInCents: number;
};

// Pending revenue is whatever of the billed total was not received yet; the balance can be
// negative when confirmed expenses exceed what came in.
function financialOf(
  billing: Billing,
  confirmedExpenseInCents: number,
  pendingExpenseInCents: number
): CustomerFinancial {
  return {
    confirmedRevenueInCents: billing.receivedInCents,
    pendingRevenueInCents: billing.totalInCents - billing.receivedInCents,
    confirmedExpenseInCents,
    pendingExpenseInCents,
    balanceInCents: billing.receivedInCents - confirmedExpenseInCents,
  };
}

export const customerDomain = { open, billingOf, financialOf };
