import { automationSettingsTable, db } from "@vetra/database";

import type { AutomationSettings } from "../domain";

const SETTINGS_ID = "default";

export async function saveAutomationSettings(settings: AutomationSettings): Promise<void> {
  await db
    .insert(automationSettingsTable)
    .values({ id: SETTINGS_ID, ...settings })
    .onConflictDoUpdate({ target: automationSettingsTable.id, set: settings });
}
