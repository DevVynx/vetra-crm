import { z } from "zod";

export const leadSummarySchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactName: z.string().nullable(),
  niche: z.string(),
  city: z.string(),
  stage: z.string(),
  prospectedAt: z.iso.datetime(),
  stoppedAtStage: z.string().nullable(),
});
export type LeadSummary = z.infer<typeof leadSummarySchema>;
