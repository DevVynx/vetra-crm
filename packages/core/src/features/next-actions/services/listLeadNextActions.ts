import { getLead } from "../../leads/services/getLead";
import type { NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";

export async function listLeadNextActions(leadId: string): Promise<NextActionWithLead[]> {
  await getLead(leadId);
  return nextActionRepositories.findNextActions({ leadId });
}
