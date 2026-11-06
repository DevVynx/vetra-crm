import { z } from "zod";

const MAX_DELAY_MINUTES = 1440;

export const automationSettingsSchema = z.object({
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: z.boolean(),
  autoSendDelayMinutes: z.number().int().min(0).max(MAX_DELAY_MINUTES),
  // Whether a lead that comes in starts with its own "Envio automático" on.
  newLeadsAutoSend: z.boolean(),
});
export type AutomationSettings = z.infer<typeof automationSettingsSchema>;

export const getAutomationSettingsResponseSchema = automationSettingsSchema;
export type GetAutomationSettingsResponse = z.infer<typeof getAutomationSettingsResponseSchema>;

export const updateAutomationSettingsRequestSchema = automationSettingsSchema;
export type UpdateAutomationSettingsRequest = z.infer<typeof updateAutomationSettingsRequestSchema>;

export const updateAutomationSettingsResponseSchema = automationSettingsSchema;
export type UpdateAutomationSettingsResponse = z.infer<
  typeof updateAutomationSettingsResponseSchema
>;
