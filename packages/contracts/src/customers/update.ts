import { z } from "zod";

import { leadSummarySchema } from "../leads/common";
import { leadContactFieldsSchema } from "../leads/contact";
import { checkDealPayment, dealPaymentShape } from "../leads/dealPayment";

export const updateCustomerRequestSchema = leadContactFieldsSchema.extend({
  document: z.string().trim().max(20).nullable(),
});
export type UpdateCustomerRequest = z.infer<typeof updateCustomerRequestSchema>;

export const updateCustomerResponseSchema = leadSummarySchema;
export type UpdateCustomerResponse = z.infer<typeof updateCustomerResponseSchema>;

export const deleteCustomerResponseSchema = z.void();
export type DeleteCustomerResponse = z.infer<typeof deleteCustomerResponseSchema>;

export const createCustomerRequestSchema = updateCustomerRequestSchema
  .extend(dealPaymentShape)
  .superRefine(checkDealPayment);
export type CreateCustomerRequest = z.infer<typeof createCustomerRequestSchema>;

export const createCustomerResponseSchema = leadSummarySchema;
export type CreateCustomerResponse = z.infer<typeof createCustomerResponseSchema>;

export const updateMonthlyFeeRequestSchema = z.object({
  monthlyFeeInCents: z.number().int().positive().nullable(),
});
export type UpdateMonthlyFeeRequest = z.infer<typeof updateMonthlyFeeRequestSchema>;
