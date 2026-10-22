import { z } from "zod";

export const leadContactFieldsSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  contactName: z.string().trim().max(120).nullable(),
  niche: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(60),
  phone: z.string().regex(/^\d{10,15}$/),
  email: z.email().nullable(),
});

export const createLeadRequestSchema = leadContactFieldsSchema;
export type CreateLeadRequest = z.infer<typeof createLeadRequestSchema>;

export const updateLeadRequestSchema = leadContactFieldsSchema;
export type UpdateLeadRequest = z.infer<typeof updateLeadRequestSchema>;
