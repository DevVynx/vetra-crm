import { z } from "zod";

import { filtersParamSchema } from "../filters";
import { leadSummarySchema } from "./common";

export const leadFilterFields = [
  "stage",
  "niche",
  "city",
  "next_action",
  "last_contact",
  "prospected_at",
] as const;

export const listLeadsQuerySchema = z.object({
  q: z.string().trim().default(""),
  filters: filtersParamSchema(leadFilterFields),
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
});
export type ListLeadsResponse = z.infer<typeof listLeadsResponseSchema>;
