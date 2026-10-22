import { z } from "zod";

import { projectStatusSchema } from "../leads/wonDeal";

export const customerProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: projectStatusSchema,
  valueInCents: z.number().int().positive(),
  startedAt: z.iso.datetime(),
  deliveredAt: z.iso.datetime().nullable(),
});
export type CustomerProject = z.infer<typeof customerProjectSchema>;

export const listCustomerProjectsResponseSchema = z.object({
  projects: z.array(customerProjectSchema),
});
export type ListCustomerProjectsResponse = z.infer<typeof listCustomerProjectsResponseSchema>;

export const createCustomerProjectRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  status: projectStatusSchema,
  valueInCents: z.number().int().positive(),
  startedAt: z.iso.datetime(),
});
export type CreateCustomerProjectRequest = z.infer<typeof createCustomerProjectRequestSchema>;
