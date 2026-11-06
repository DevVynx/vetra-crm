import type { LeadWithPhoto } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function updateLeadAutoSend(id: string, autoSend: boolean): Promise<LeadWithPhoto> {
  const lead = await leadRepositories.setLeadAutoSend(id, autoSend);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
