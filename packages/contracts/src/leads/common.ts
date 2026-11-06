import { z } from "zod";

// It becomes the href of a link, and z.url() alone also accepts "javascript:" addresses.
export const demoUrlSchema = z.url({ protocol: /^https?$/ }).max(2048);

export const leadSummarySchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactName: z.string().nullable(),
  niche: z.string(),
  city: z.string(),
  stage: z.string(),
  prospectedAt: z.iso.datetime(),
  stoppedAtStage: z.string().nullable(),
  doNotContact: z.boolean(),
  autoSend: z.boolean(),
});
export type LeadSummary = z.infer<typeof leadSummarySchema>;
