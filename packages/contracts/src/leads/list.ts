import { z } from "zod";

import { liveStageSchema, leadSummarySchema } from "./common";

// "all" is every live lead (not won, lost or without response); "archived" is lost plus no_response.
export const leadListFilterSchema = z.enum([
  "all",
  "without_next_action",
  "archived",
  ...liveStageSchema.options,
]);
export type LeadListFilter = z.infer<typeof leadListFilterSchema>;

export const listLeadsQuerySchema = z.object({
  q: z.string().trim().default(""),
  filter: leadListFilterSchema.default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const leadListItemSchema = leadSummarySchema.extend({
  nextAction: z.object({ description: z.string(), dueAt: z.iso.datetime() }).nullable(),
  lastContactAt: z.iso.datetime().nullable(),
});
export type LeadListItem = z.infer<typeof leadListItemSchema>;

export const listLeadsResponseSchema = z.object({
  items: z.array(leadListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  counts: z.record(leadListFilterSchema, z.number().int().nonnegative()),
});
export type ListLeadsResponse = z.infer<typeof listLeadsResponseSchema>;
