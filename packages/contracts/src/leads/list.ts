import { z } from "zod";

import { filtersParamSchema } from "../filters";
import { checkSortParams, sortParamsShape } from "../sort";
import { leadSummarySchema } from "./common";

export const leadFilterFields = [
  "stage",
  "niche",
  "city",
  "next_action",
  "last_contact",
  "prospected_at",
] as const;

export const leadSortFields = [
  "next_action",
  "prospected_at",
  "last_contact",
  "business_name",
  "niche",
  "city",
] as const;
export type LeadSortField = (typeof leadSortFields)[number];

export const listLeadsQuerySchema = z
  .object({
    q: z.string().trim().default(""),
    filters: filtersParamSchema(leadFilterFields),
    ...sortParamsShape(leadSortFields),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .superRefine(checkSortParams);
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const listLeadIdsQuerySchema = z.object({
  q: z.string().trim().default(""),
  filters: filtersParamSchema(leadFilterFields),
});
export type ListLeadIdsQuery = z.infer<typeof listLeadIdsQuerySchema>;

export const listLeadIdsResponseSchema = z.object({ ids: z.array(z.string()) });
export type ListLeadIdsResponse = z.infer<typeof listLeadIdsResponseSchema>;

export const leadListItemSchema = leadSummarySchema.extend({
  photoUrl: z.string().nullable(),
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
