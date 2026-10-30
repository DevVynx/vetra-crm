import { z } from "zod";

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
  projectName: z.string().nullable(),
});
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export const listLedgerEntriesResponseSchema = z.object({ entries: z.array(ledgerEntrySchema) });
export type ListLedgerEntriesResponse = z.infer<typeof listLedgerEntriesResponseSchema>;

const ledgerEntryInputSchema = z.object({
  description: z.string().trim().min(1).max(120),
  amountInCents: z.number().int().positive(),
  status: ledgerEntryStatusSchema,
  occurredAt: z.iso.datetime(),
});

export const createLedgerEntryRequestSchema = ledgerEntryInputSchema.extend({
  type: ledgerEntryTypeSchema,
});
export type CreateLedgerEntryRequest = z.infer<typeof createLedgerEntryRequestSchema>;

export const createLedgerEntryResponseSchema = ledgerEntrySchema;
export type CreateLedgerEntryResponse = z.infer<typeof createLedgerEntryResponseSchema>;

export const updateLedgerEntryRequestSchema = ledgerEntryInputSchema;
export type UpdateLedgerEntryRequest = z.infer<typeof updateLedgerEntryRequestSchema>;
