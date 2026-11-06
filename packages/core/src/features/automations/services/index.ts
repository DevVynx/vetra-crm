import { archiveUnanswered } from "./archiveUnanswered";
import { getAutoSendLeadsCounts, setAutoSendForAllLeads } from "./autoSendOfLeads";
import { getAutomationSettings } from "./getAutomationSettings";
import { runAutoSend } from "./runAutoSend";
import { startAutoSend } from "./startAutoSend";
import { updateAutomationSettings } from "./updateAutomationSettings";

export const automationServices = {
  archiveUnanswered,
  getAutoSendLeadsCounts,
  getAutomationSettings,
  runAutoSend,
  setAutoSendForAllLeads,
  startAutoSend,
  updateAutomationSettings,
};
