import { z } from "zod";

import { leadSummarySchema } from "./common";
import { dealPaymentSchema } from "./dealPayment";

export const closeLeadRequestSchema = dealPaymentSchema;
export type CloseLeadRequest = z.infer<typeof closeLeadRequestSchema>;

export const closeLeadResponseSchema = leadSummarySchema;
export type CloseLeadResponse = z.infer<typeof closeLeadResponseSchema>;

export const leadParamsSchema = z.object({ id: z.string().min(1) });
export type LeadParams = z.infer<typeof leadParamsSchema>;

// What a stage change touches, sent back to the API to undo it exactly.
export const leadStageStateSchema = z.object({
  id: z.string(),
  stage: z.string(),
  stoppedAtStage: z.string().nullable(),
  stageChangedAt: z.iso.datetime(),
});
export type LeadStageState = z.infer<typeof leadStageStateSchema>;

// The closing stage goes through closeLeadRequestSchema, which carries the deal data.
export const updateLeadsStageRequestSchema = z.object({
  ids: z.array(z.string()).min(1),
  stage: z.string(),
});
export type UpdateLeadsStageRequest = z.infer<typeof updateLeadsStageRequestSchema>;

export const updateLeadsStageResponseSchema = z.object({
  previous: z.array(leadStageStateSchema),
});
export type UpdateLeadsStageResponse = z.infer<typeof updateLeadsStageResponseSchema>;

export const restoreLeadStagesRequestSchema = z.object({
  leads: z.array(leadStageStateSchema).min(1),
});
export type RestoreLeadStagesRequest = z.infer<typeof restoreLeadStagesRequestSchema>;

export const restoreLeadStagesResponseSchema = z.void();
export type RestoreLeadStagesResponse = z.infer<typeof restoreLeadStagesResponseSchema>;
