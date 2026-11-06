import { automationSettingsTable, db } from "@vetra/database";

import { type AutomationSettings, DEFAULT_AUTOMATION_SETTINGS } from "../domain";

const SETTINGS_ID = "default";

export async function saveAutomationSettings(settings: AutomationSettings): Promise<void> {
  const { followUpWaitDays, ...rest } = settings;
  const defaults = DEFAULT_AUTOMATION_SETTINGS.followUpWaitDays;
  const columns = {
    ...rest,
    followUp1WaitDays: followUpWaitDays[0] ?? defaults[0],
    followUp2WaitDays: followUpWaitDays[1] ?? defaults[1],
    followUp3WaitDays: followUpWaitDays[2] ?? defaults[2],
  };

  await db
    .insert(automationSettingsTable)
    .values({ id: SETTINGS_ID, ...columns })
    .onConflictDoUpdate({ target: automationSettingsTable.id, set: columns });
}
