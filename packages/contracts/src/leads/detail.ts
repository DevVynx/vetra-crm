import { z } from "zod";

import { demoUrlSchema, leadSummarySchema } from "./common";

export const leadDetailSchema = leadSummarySchema.extend({
  phone: z.string().regex(/^\d{8,15}$/),
  email: z.email().nullable(),
  demoUrl: demoUrlSchema.nullable(),
  stageChangedAt: z.iso.datetime(),
  lastContactAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type LeadDetail = z.infer<typeof leadDetailSchema>;

export const getLeadResponseSchema = leadDetailSchema;
export type GetLeadResponse = z.infer<typeof getLeadResponseSchema>;

export const leadNoteSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  content: z.string().min(1),
  createdAt: z.iso.datetime(),
});
export type LeadNote = z.infer<typeof leadNoteSchema>;

export const listLeadNotesResponseSchema = z.object({ notes: z.array(leadNoteSchema) });
export type ListLeadNotesResponse = z.infer<typeof listLeadNotesResponseSchema>;

export const createLeadNoteRequestSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});
export type CreateLeadNoteRequest = z.infer<typeof createLeadNoteRequestSchema>;

export const createLeadNoteResponseSchema = leadNoteSchema;
export type CreateLeadNoteResponse = z.infer<typeof createLeadNoteResponseSchema>;

export const updateLeadNoteRequestSchema = createLeadNoteRequestSchema;
export type UpdateLeadNoteRequest = CreateLeadNoteRequest;

export const updateLeadNoteResponseSchema = leadNoteSchema;
export type UpdateLeadNoteResponse = z.infer<typeof updateLeadNoteResponseSchema>;

export const deleteLeadNoteResponseSchema = z.void();
export type DeleteLeadNoteResponse = z.infer<typeof deleteLeadNoteResponseSchema>;

export const leadNoteParamsSchema = z.object({ id: z.string().min(1) });
export type LeadNoteParams = z.infer<typeof leadNoteParamsSchema>;

// Undo of a deletion: the deleted note is sent back as it was.
export const restoreLeadNoteRequestSchema = leadNoteSchema;
export type RestoreLeadNoteRequest = z.infer<typeof restoreLeadNoteRequestSchema>;

export const restoreLeadNoteResponseSchema = z.void();
export type RestoreLeadNoteResponse = z.infer<typeof restoreLeadNoteResponseSchema>;
