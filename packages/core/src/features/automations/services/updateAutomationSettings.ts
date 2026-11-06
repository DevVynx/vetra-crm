import type { AutomationSettings } from "../domain";
import { automationRepositories } from "../repositories";

export async function updateAutomationSettings(
  settings: AutomationSettings
): Promise<AutomationSettings> {
  await automationRepositories.saveAutomationSettings(settings);

  return settings;
}
