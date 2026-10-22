import { z } from "zod";

import { leadSummarySchema } from "./common";

export const leadDetailSchema = leadSummarySchema.extend({
  phone: z.string().regex(/^\d{10,15}$/),
  email: z.email().nullable(),
  demoUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type LeadDetail = z.infer<typeof leadDetailSchema>;

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

export const updateLeadNoteRequestSchema = createLeadNoteRequestSchema;
export type UpdateLeadNoteRequest = CreateLeadNoteRequest;
