import { z } from "zod";

export const leadStageSchema = z.enum([
  "prospected",
  "demo_published",
  "approach_sent",
  "conversing",
  "meeting",
  "proposal_sent",
  "won",
  "lost",
  "no_response",
]);
export type LeadStage = z.infer<typeof leadStageSchema>;

export const leadSummarySchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactName: z.string().nullable(),
  niche: z.string(),
  city: z.string(),
  stage: leadStageSchema,
});
export type LeadSummary = z.infer<typeof leadSummarySchema>;
