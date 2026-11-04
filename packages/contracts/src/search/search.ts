import { z } from "zod";

export const SEARCH_MIN_LENGTH = 2;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(SEARCH_MIN_LENGTH),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const searchKindSchema = z.enum(["leads", "customers", "projects", "notes", "next_actions"]);
export type SearchKind = z.infer<typeof searchKindSchema>;

export const searchItemSchema = z.object({
  id: z.string(),
  primary: z.string(),
  secondary: z.string(),
  // The lead or customer whose screen opens this result.
  targetId: z.string(),
});
export type SearchItem = z.infer<typeof searchItemSchema>;

export const searchGroupSchema = z.object({
  kind: searchKindSchema,
  items: z.array(searchItemSchema),
});
export type SearchGroup = z.infer<typeof searchGroupSchema>;

// One group per kind, always in display order; a kind without matches comes back empty.
export const searchResponseSchema = z.object({ groups: z.array(searchGroupSchema) });
export type SearchResponse = z.infer<typeof searchResponseSchema>;
