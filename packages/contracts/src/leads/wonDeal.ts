import { z } from "zod";

export const projectStatusSchema = z.enum(["in_production", "delivered"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const installmentSchema = z.object({
  id: z.string(),
  amountInCents: z.number().int().positive(),
  dueAt: z.iso.datetime(),
  paidAt: z.iso.datetime().nullable(),
  // Set when the installment was registered by hand; otherwise the ledger derives them.
  description: z.string().min(1).optional(),
  createdAt: z.iso.datetime().optional(),
});
export type Installment = z.infer<typeof installmentSchema>;

export const wonDealSchema = z.object({
  leadId: z.string(),
  closedValueInCents: z.number().int().positive(),
  closedAt: z.iso.datetime(),
  installments: z.array(installmentSchema),
  monthlyFeeInCents: z.number().int().positive().nullable(),
  projectStatus: projectStatusSchema,
});
export type WonDeal = z.infer<typeof wonDealSchema>;
