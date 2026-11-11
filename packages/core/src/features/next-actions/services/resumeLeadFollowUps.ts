import { getLead } from "../../leads/services/getLead";
import type { FollowUpsSnapshot } from "../domain";
import { nextActionRepositories } from "../repositories";

// Undo of cancelling a lead's follow-ups. What the snapshot holds for another lead is not this lead's to restore.
export async function resumeLeadFollowUps(
  leadId: string,
  snapshot: FollowUpsSnapshot
): Promise<void> {
  await getLead(leadId);
  await nextActionRepositories.restoreFollowUpsOfLead(leadId, {
    ...snapshot,
    actions: snapshot.actions.filter((action) => action.leadId === leadId),
  });
}
