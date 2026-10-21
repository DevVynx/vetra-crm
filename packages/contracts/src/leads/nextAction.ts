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
  dueAt: z.iso.datetime(),
  lead: leadSummarySchema,
});
export type NextAction = z.infer<typeof nextActionSchema>;

export const nextActionInputSchema = z.object({
  type: nextActionTypeSchema,
  followUpStep: z.number().int().positive().nullable(),
  description: z.string().trim().min(1),
  dueAt: z.iso.datetime(),
});
export type NextActionInput = z.infer<typeof nextActionInputSchema>;

export const listNextActionsResponseSchema = z.object({
  nextActions: z.array(nextActionSchema),
});
export type ListNextActionsResponse = z.infer<typeof listNextActionsResponseSchema>;

export const completeNextActionRequestSchema = z.object({
  next: nextActionInputSchema,
});
export type CompleteNextActionRequest = z.infer<typeof completeNextActionRequestSchema>;

export const rescheduleNextActionRequestSchema = z.object({
  dueAt: z.iso.datetime(),
});
export type RescheduleNextActionRequest = z.infer<typeof rescheduleNextActionRequestSchema>;

export const createNextActionRequestSchema = nextActionInputSchema.extend({
  leadId: z.string(),
});
export type CreateNextActionRequest = z.infer<typeof createNextActionRequestSchema>;

export const listLeadsWithoutNextActionResponseSchema = z.object({
  leads: z.array(leadSummarySchema),
});
export type ListLeadsWithoutNextActionResponse = z.infer<
  typeof listLeadsWithoutNextActionResponseSchema
>;
