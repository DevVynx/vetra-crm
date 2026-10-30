import { z } from "zod";

import { leadDetailSchema } from "../leads/detail";

const amountInCentsSchema = z.number().int().nonnegative();
const countSchema = z.number().int().nonnegative();

export const customerDetailSchema = leadDetailSchema.extend({
  document: z.string().nullable(),
  closedAt: z.iso.datetime(),
  billing: z.object({
    receivedInCents: amountInCentsSchema,
    totalInCents: amountInCentsSchema,
    monthlyFeeInCents: amountInCentsSchema.nullable(),
  }),
  projectMetrics: z.object({
    total: countSchema,
    active: countSchema,
    completed: countSchema,
  }),
  financial: z.object({
    confirmedRevenueInCents: amountInCentsSchema,
    pendingRevenueInCents: amountInCentsSchema,
    confirmedExpenseInCents: amountInCentsSchema,
    pendingExpenseInCents: amountInCentsSchema,
    // Confirmed revenue minus confirmed expense, so it can be negative.
    balanceInCents: z.number().int(),
  }),
});
export type CustomerDetail = z.infer<typeof customerDetailSchema>;

export const getCustomerResponseSchema = customerDetailSchema;
export type GetCustomerResponse = z.infer<typeof getCustomerResponseSchema>;
