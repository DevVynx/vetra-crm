import { z } from "zod";

import { demoUrlSchema, leadSummarySchema } from "./common";

export const leadContactFieldsSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  contactName: z.string().trim().max(120).nullable(),
  niche: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(60),
  phone: z.string().regex(/^\d{10,15}$/),
  email: z.email().nullable(),
});

const leadFieldsSchema = leadContactFieldsSchema.extend({ demoUrl: demoUrlSchema.nullable() });

export const createLeadRequestSchema = leadFieldsSchema;
export type CreateLeadRequest = z.infer<typeof createLeadRequestSchema>;

export const createLeadResponseSchema = leadSummarySchema;
export type CreateLeadResponse = z.infer<typeof createLeadResponseSchema>;

export const updateLeadRequestSchema = leadFieldsSchema;
export type UpdateLeadRequest = z.infer<typeof updateLeadRequestSchema>;

export const updateLeadResponseSchema = leadSummarySchema;
export type UpdateLeadResponse = z.infer<typeof updateLeadResponseSchema>;

export const deleteLeadResponseSchema = z.void();
export type DeleteLeadResponse = z.infer<typeof deleteLeadResponseSchema>;
