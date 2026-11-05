import type { LeadWithPhoto } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function getLead(id: string): Promise<LeadWithPhoto> {
  const lead = await leadRepositories.findLeadById(id);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
