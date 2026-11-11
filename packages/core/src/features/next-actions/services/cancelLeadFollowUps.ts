import { getLead } from "../../leads/services/getLead";
import type { FollowUpsSnapshot } from "../domain";
import { nextActionRepositories } from "../repositories";

export async function cancelLeadFollowUps(leadId: string): Promise<FollowUpsSnapshot> {
  await getLead(leadId);
  return nextActionRepositories.cancelFollowUpsOfLead(leadId);
}
