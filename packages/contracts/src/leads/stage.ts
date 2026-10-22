import { z } from "zod";

import { leadStageSchema } from "./common";

// Closing goes through closeLeadRequestSchema, which carries the deal data.
export const updateLeadStageRequestSchema = z.object({
  stage: leadStageSchema.exclude(["won"]),
});
export type UpdateLeadStageRequest = z.infer<typeof updateLeadStageRequestSchema>;

export const closeLeadRequestSchema = z.object({
  closedValueInCents: z.number().int().positive(),
  firstInstallmentDueAt: z.iso.datetime(),
});
export type CloseLeadRequest = z.infer<typeof closeLeadRequestSchema>;
