import { z } from "zod";

import { leadSummarySchema } from "./common";

export const nextActionTypeSchema = z.enum([
  "first_approach",
  "follow_up",
  "meeting",
  "proposal",
  "custom",
]);
export type NextActionType = z.infer<typeof nextActionTypeSchema>;

export const nextActionSchema = z.object({
  id: z.string(),
  type: nextActionTypeSchema,
  followUpStep: z.number().int().positive().nullable(),
  description: z.string().min(1),
  body: z.string().nullable(),
  dueAt: z.iso.datetime(),
  lead: leadSummarySchema,
});
export type NextAction = z.infer<typeof nextActionSchema>;

export const nextActionInputSchema = z.object({
  type: nextActionTypeSchema,
  followUpStep: z.number().int().positive().nullable(),
  description: z.string().trim().min(1),
  // 4000 is also the limit of the import (core does not import contracts) and of the text area in
  // the web: keep the three equal.
  body: z
    .string()
    .trim()
    .max(4000)
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .default(null),
  dueAt: z.iso.datetime(),
});
export type NextActionInput = z.infer<typeof nextActionInputSchema>;

export const listNextActionsResponseSchema = z.object({
  nextActions: z.array(nextActionSchema),
});
export type ListNextActionsResponse = z.infer<typeof listNextActionsResponseSchema>;

export const completeNextActionResponseSchema = z.void();
export type CompleteNextActionResponse = z.infer<typeof completeNextActionResponseSchema>;

export const reopenNextActionResponseSchema = nextActionSchema;
export type ReopenNextActionResponse = z.infer<typeof reopenNextActionResponseSchema>;

export const deleteNextActionResponseSchema = z.void();
export type DeleteNextActionResponse = z.infer<typeof deleteNextActionResponseSchema>;

export const restoreNextActionRequestSchema = nextActionInputSchema.extend({
  id: z.string().min(1),
  leadId: z.string().min(1),
});
export type RestoreNextActionRequest = z.infer<typeof restoreNextActionRequestSchema>;

export const restoreNextActionResponseSchema = z.void();
export type RestoreNextActionResponse = z.infer<typeof restoreNextActionResponseSchema>;

export const updateNextActionRequestSchema = nextActionInputSchema;
export type UpdateNextActionRequest = z.infer<typeof updateNextActionRequestSchema>;

export const updateNextActionResponseSchema = nextActionSchema;
export type UpdateNextActionResponse = z.infer<typeof updateNextActionResponseSchema>;

export const createNextActionRequestSchema = nextActionInputSchema.extend({
  leadId: z.string(),
});
export type CreateNextActionRequest = z.infer<typeof createNextActionRequestSchema>;

export const createNextActionResponseSchema = nextActionSchema;
export type CreateNextActionResponse = z.infer<typeof createNextActionResponseSchema>;

export const listLeadsWithoutNextActionResponseSchema = z.object({
  leads: z.array(leadSummarySchema),
});
export type ListLeadsWithoutNextActionResponse = z.infer<
  typeof listLeadsWithoutNextActionResponseSchema
>;

export const nextActionParamsSchema = z.object({ id: z.string().min(1) });
export type NextActionParams = z.infer<typeof nextActionParamsSchema>;
