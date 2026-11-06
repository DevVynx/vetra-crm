import { automationSettingsTable, db } from "@vetra/database";

import { type AutomationSettings, DEFAULT_AUTOMATION_SETTINGS } from "../domain";

// Without the row, nothing was ever changed, and the defaults apply.
export async function findAutomationSettings(): Promise<AutomationSettings> {
  const [row] = await db.select().from(automationSettingsTable).limit(1);
  if (!row) return DEFAULT_AUTOMATION_SETTINGS;

  return {
    autoSendEnabled: row.autoSendEnabled,
    autoSendDelayMinutes: row.autoSendDelayMinutes,
    newLeadsAutoSend: row.newLeadsAutoSend,
    moveOnSendEnabled: row.moveOnSendEnabled,
    moveOnSendStageId: row.moveOnSendStageId,
    moveOnReplyEnabled: row.moveOnReplyEnabled,
    moveOnReplyStageId: row.moveOnReplyStageId,
    cancelFollowUpsOnReply: row.cancelFollowUpsOnReply,
    archiveUnansweredEnabled: row.archiveUnansweredEnabled,
    archiveUnansweredStageId: row.archiveUnansweredStageId,
    archiveUnansweredDays: row.archiveUnansweredDays,
  };
}
