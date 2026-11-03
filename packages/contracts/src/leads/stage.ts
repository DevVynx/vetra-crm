import { z } from "zod";

import { leadSummarySchema } from "./common";
import { dealPaymentSchema } from "./dealPayment";

// The closing stage goes through closeLeadRequestSchema, which carries the deal data.
export const updateLeadStageRequestSchema = z.object({
  stage: z.string(),
});
export type UpdateLeadStageRequest = z.infer<typeof updateLeadStageRequestSchema>;

export const updateLeadStageResponseSchema = leadSummarySchema;
export type UpdateLeadStageResponse = z.infer<typeof updateLeadStageResponseSchema>;

export const closeLeadRequestSchema = dealPaymentSchema;
export type CloseLeadRequest = z.infer<typeof closeLeadRequestSchema>;

export const closeLeadResponseSchema = leadSummarySchema;
export type CloseLeadResponse = z.infer<typeof closeLeadResponseSchema>;
