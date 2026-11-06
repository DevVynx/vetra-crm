import type { AutomationSettings } from "../domain";
import { automationRepositories } from "../repositories";

export async function getAutomationSettings(): Promise<AutomationSettings> {
  return automationRepositories.findAutomationSettings();
}
