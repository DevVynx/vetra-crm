import { leadRepositories } from "../../leads/repositories";
import { nextActionRepositories } from "../../next-actions/repositories";
import { automationRepositories } from "../repositories";
import { moveLeadByAutomation } from "./moveLeadByAutomation";

// A message received from a lead moves it on and/or cancels its pending follow-ups, each if its switch is
// on. A reply is information, not contact, so a lead marked "Não contatar" is treated the same. Never
// throws: the message is already saved, and this must not break the sync that brought it.
// An answer that looks automatic (see isAutomaticReply) still moves the lead, but does not cancel its
// follow-ups: a bot answering says nothing about the person's interest.
export async function reactToReply(
  phoneKey: string | null,
  { isAutomatic = false }: { isAutomatic?: boolean } = {}
): Promise<void> {
  if (!phoneKey) return;

  try {
    const settings = await automationRepositories.findAutomationSettings();
    if (!settings.autoSendEnabled) return;

    const leadId = await leadRepositories.findLeadIdByPhoneKey(phoneKey);
    if (!leadId) return;

    if (settings.moveOnReplyEnabled) {
      await moveLeadByAutomation(leadId, settings.moveOnReplyStageId, { kind: "forward" });
    }
    if (settings.cancelFollowUpsOnReply && !isAutomatic) {
      await nextActionRepositories.deleteFollowUpsOfLead(leadId);
    }
  } catch (error) {
    console.error(
      `Automation after a reply failed: ${error instanceof Error ? error.name : "unknown error"}`
    );
  }
}
