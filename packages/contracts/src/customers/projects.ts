import { z } from "zod";

export const projectStatusSchema = z.enum(["in_production", "delivered"]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

const amountInCentsSchema = z.number().int().nonnegative();

export const customerProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: projectStatusSchema,
  valueInCents: z.number().int().positive(),
  startedAt: z.iso.datetime(),
  deliveredAt: z.iso.datetime().nullable(),
  // Money of the ledger entries linked to this project.
  financial: z.object({
    receivedInCents: amountInCentsSchema,
    pendingInCents: amountInCentsSchema,
    expensesInCents: amountInCentsSchema,
    linkedEntriesCount: z.number().int().nonnegative(),
  }),
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

export const createCustomerProjectResponseSchema = customerProjectSchema;
export type CreateCustomerProjectResponse = z.infer<typeof createCustomerProjectResponseSchema>;

export const updateCustomerProjectRequestSchema = createCustomerProjectRequestSchema;
export type UpdateCustomerProjectRequest = z.infer<typeof updateCustomerProjectRequestSchema>;

export const updateCustomerProjectResponseSchema = customerProjectSchema;
export type UpdateCustomerProjectResponse = z.infer<typeof updateCustomerProjectResponseSchema>;

export const deleteCustomerProjectResponseSchema = z.void();
export type DeleteCustomerProjectResponse = z.infer<typeof deleteCustomerProjectResponseSchema>;

export const customerProjectParamsSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});
export type CustomerProjectParams = z.infer<typeof customerProjectParamsSchema>;
