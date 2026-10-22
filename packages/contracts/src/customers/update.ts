import { z } from "zod";

import { leadContactFieldsSchema } from "../leads/contact";

export const updateCustomerRequestSchema = leadContactFieldsSchema.extend({
  document: z.string().trim().max(20).nullable(),
});
export type UpdateCustomerRequest = z.infer<typeof updateCustomerRequestSchema>;

export const createCustomerRequestSchema = updateCustomerRequestSchema.extend({
  closedValueInCents: z.number().int().positive(),
  firstInstallmentDueAt: z.iso.datetime(),
});
export type CreateCustomerRequest = z.infer<typeof createCustomerRequestSchema>;
