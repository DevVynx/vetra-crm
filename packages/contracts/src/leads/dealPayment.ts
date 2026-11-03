import { z } from "zod";

export const MAX_INSTALLMENTS = 24;

export const dealPaymentShape = {
  closedValueInCents: z.number().int().positive(),
  // Paid when the deal closes (cash payment or down payment).
  receivedInCents: z.number().int().nonnegative(),
  // How many installments the rest is split into; 0 leaves the rest unscheduled.
  installmentsCount: z.number().int().min(0).max(MAX_INSTALLMENTS),
  firstInstallmentDueAt: z.iso.datetime().optional(),
};

type DealPayment = {
  closedValueInCents: number;
  receivedInCents: number;
  installmentsCount: number;
  firstInstallmentDueAt?: string | undefined;
};

export function checkDealPayment(payment: DealPayment, ctx: z.RefinementCtx) {
  const remaining = payment.closedValueInCents - payment.receivedInCents;
  if (remaining < 0) {
    ctx.addIssue({
      code: "custom",
      path: ["receivedInCents"],
      message: "receivedExceedsClosedValue",
    });
  }
  if (remaining > 0 && payment.installmentsCount > 0 && !payment.firstInstallmentDueAt) {
    ctx.addIssue({
      code: "custom",
      path: ["firstInstallmentDueAt"],
      message: "firstInstallmentDueAtRequired",
    });
  }
}

export const dealPaymentSchema = z.object(dealPaymentShape).superRefine(checkDealPayment);
export type DealPaymentRequest = z.infer<typeof dealPaymentSchema>;
