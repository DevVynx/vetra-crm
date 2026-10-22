import { z } from "zod";

import { leadSummarySchema } from "../leads/common";

const amountInCentsSchema = z.number().int().nonnegative();
const countSchema = z.number().int().nonnegative();

export const customerListFilterSchema = z.enum([
  "all",
  "with_active_project",
  "without_active_project",
]);
export type CustomerListFilter = z.infer<typeof customerListFilterSchema>;

export const listCustomersQuerySchema = z.object({
  q: z.string().trim().default(""),
  filter: customerListFilterSchema.default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;

export const customerListItemSchema = leadSummarySchema.extend({
  closedAt: z.iso.datetime(),
  closedValueInCents: amountInCentsSchema,
  receivedInCents: amountInCentsSchema,
  monthlyFeeInCents: amountInCentsSchema.nullable(),
  activeProjectsCount: countSchema,
  projectsCount: countSchema,
});
export type CustomerListItem = z.infer<typeof customerListItemSchema>;

export const listCustomersResponseSchema = z.object({
  items: z.array(customerListItemSchema),
  total: countSchema,
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  counts: z.record(customerListFilterSchema, countSchema),
});
export type ListCustomersResponse = z.infer<typeof listCustomersResponseSchema>;
