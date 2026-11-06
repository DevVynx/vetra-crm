import {
  type AutoSendLeadsCounts,
  countAutoSendLeads,
  setAutoSendOfLeads,
} from "../repositories/autoSendOfLeads";
import { getAutomationSettings } from "./getAutomationSettings";

export type { AutoSendLeadsCounts };

// What the screen tells before it turns the sending on or off for every lead at once.
export async function getAutoSendLeadsCounts(): Promise<AutoSendLeadsCounts> {
  const { autoSendDelayMinutes } = await getAutomationSettings();

  return countAutoSendLeads(autoSendDelayMinutes);
}

export async function setAutoSendForAllLeads(autoSend: boolean): Promise<number> {
  return setAutoSendOfLeads(autoSend);
}
