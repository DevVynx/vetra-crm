import { z } from "zod";

// What the screen tells before turning the automatic sending on or off for every lead at once.
export const automationLeadsSummarySchema = z.object({
  // The leads in the funnel that did not ask to stop: the ones "ligar em todos" reaches.
  total: z.number().int().min(0),
  withSending: z.number().int().min(0),
  // Texts already due, of leads that have the sending off, that would go at once if it were turned on.
  dueTexts: z.number().int().min(0),
});
export type AutomationLeadsSummary = z.infer<typeof automationLeadsSummarySchema>;

export const getAutomationLeadsResponseSchema = automationLeadsSummarySchema;
export type GetAutomationLeadsResponse = z.infer<typeof getAutomationLeadsResponseSchema>;

export const setAutomationLeadsRequestSchema = z.object({ autoSend: z.boolean() });
export type SetAutomationLeadsRequest = z.infer<typeof setAutomationLeadsRequestSchema>;

export const setAutomationLeadsResponseSchema = z.object({ changed: z.number().int().min(0) });
export type SetAutomationLeadsResponse = z.infer<typeof setAutomationLeadsResponseSchema>;
