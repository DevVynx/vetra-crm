import { z } from "zod";

const MAX_DELAY_MINUTES = 1440;
const MAX_UNANSWERED_DAYS = 3650;
const MAX_FOLLOW_UPS = 3;

export const automationSettingsSchema = z.object({
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: z.boolean(),
  autoSendDelayMinutes: z.number().int().min(0).max(MAX_DELAY_MINUTES),
  // Whether a lead that comes in starts with its own "Envio automático" on.
  newLeadsAutoSend: z.boolean(),
  // Reactions to the conversation, each with its own switch and, when it moves a lead, the stage to move it to.
  moveOnSendEnabled: z.boolean(),
  moveOnSendStageId: z.string().nullable(),
  moveOnReplyEnabled: z.boolean(),
  moveOnReplyStageId: z.string().nullable(),
  cancelFollowUpsOnReply: z.boolean(),
  archiveUnansweredEnabled: z.boolean(),
  archiveUnansweredStageId: z.string().nullable(),
  archiveUnansweredDays: z.number().int().min(1).max(MAX_UNANSWERED_DAYS),
  // How many follow-up texts of the pipeline are kept (the first ones, in order) and the days to wait before each.
  followUpLimit: z.number().int().min(0).max(MAX_FOLLOW_UPS),
  followUpWaitDays: z.array(z.number().int().min(0).max(MAX_UNANSWERED_DAYS)).length(3),
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
