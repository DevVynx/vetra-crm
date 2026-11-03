import type { Lead } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function getLead(id: string): Promise<Lead> {
  const lead = await leadRepositories.findLeadById(id);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
