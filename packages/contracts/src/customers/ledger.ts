import { z } from "zod";

import { filtersParamSchema } from "../filters";

export const ledgerEntryTypeSchema = z.enum(["revenue", "expense"]);
export type LedgerEntryType = z.infer<typeof ledgerEntryTypeSchema>;

export const ledgerEntryStatusSchema = z.enum(["confirmed", "pending"]);
export type LedgerEntryStatus = z.infer<typeof ledgerEntryStatusSchema>;

export const ledgerEntrySchema = z.object({
  id: z.string(),
  type: ledgerEntryTypeSchema,
  description: z.string().min(1),
  amountInCents: z.number().int().positive(),
  status: ledgerEntryStatusSchema,
  // When it was confirmed, or when it is due while still pending.
  occurredAt: z.iso.datetime(),
  // When the entry was registered, which can differ from when it happened.
  createdAt: z.iso.datetime(),
  projectId: z.string().nullable(),
  projectName: z.string().nullable(),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export const ledgerFilterFields = ["type", "status", "project", "amount", "date"] as const;

// The id the "project" filter uses for entries that are not linked to any project.
export const NO_PROJECT_FILTER_VALUE = "none";

export const listLedgerEntriesQuerySchema = z.object({
  filters: filtersParamSchema(ledgerFilterFields),
});
export type ListLedgerEntriesQuery = z.infer<typeof listLedgerEntriesQuerySchema>;

export const listLedgerEntriesResponseSchema = z.object({ entries: z.array(ledgerEntrySchema) });
export type ListLedgerEntriesResponse = z.infer<typeof listLedgerEntriesResponseSchema>;

const ledgerEntryInputSchema = z.object({
  description: z.string().trim().min(1).max(120),
  amountInCents: z.number().int().positive(),
  status: ledgerEntryStatusSchema,
  occurredAt: z.iso.datetime(),
  projectId: z.string().nullable(),
});

export const createLedgerEntryRequestSchema = ledgerEntryInputSchema.extend({
  type: ledgerEntryTypeSchema,
});
export type CreateLedgerEntryRequest = z.infer<typeof createLedgerEntryRequestSchema>;

export const createLedgerEntryResponseSchema = ledgerEntrySchema;
export type CreateLedgerEntryResponse = z.infer<typeof createLedgerEntryResponseSchema>;

export const updateLedgerEntryRequestSchema = ledgerEntryInputSchema;
export type UpdateLedgerEntryRequest = z.infer<typeof updateLedgerEntryRequestSchema>;

export const updateLedgerEntryResponseSchema = ledgerEntrySchema;
export type UpdateLedgerEntryResponse = z.infer<typeof updateLedgerEntryResponseSchema>;

export const deleteLedgerEntryResponseSchema = z.void();
export type DeleteLedgerEntryResponse = z.infer<typeof deleteLedgerEntryResponseSchema>;

export const ledgerEntryParamsSchema = z.object({
  id: z.string().min(1),
  entryId: z.string().min(1),
});
export type LedgerEntryParams = z.infer<typeof ledgerEntryParamsSchema>;

// Undo of a deletion: the deleted entry is sent back as it was.
export const restoreLedgerEntryRequestSchema = ledgerEntrySchema;
export type RestoreLedgerEntryRequest = z.infer<typeof restoreLedgerEntryRequestSchema>;

export const restoreLedgerEntryResponseSchema = z.void();
export type RestoreLedgerEntryResponse = z.infer<typeof restoreLedgerEntryResponseSchema>;
