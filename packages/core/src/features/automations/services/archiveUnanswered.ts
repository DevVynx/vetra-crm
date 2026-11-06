import { moveLeadByAutomation } from "../helpers/moveLeadByAutomation";
import { automationRepositories } from "../repositories";

// One pass of "Sem resposta": archives the leads whose conversation ran out. Each is checked again by the
// move itself, so a lead that is no longer in the funnel is skipped.
export async function archiveUnanswered(now: Date = new Date()): Promise<number> {
  const settings = await automationRepositories.findAutomationSettings();
  if (
    !settings.autoSendEnabled ||
    !settings.archiveUnansweredEnabled ||
    !settings.archiveUnansweredStageId
  ) {
    return 0;
  }

  const leadIds = await automationRepositories.findUnansweredLeadIds(
    settings.archiveUnansweredDays,
    now
  );

  let archived = 0;
  for (const leadId of leadIds) {
    if (
      await moveLeadByAutomation(leadId, settings.archiveUnansweredStageId, { kind: "archive" })
    ) {
      archived++;
    }
  }

  return archived;
}
