import type { LeadWithPhoto } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function updateLeadDoNotContact(
  id: string,
  doNotContact: boolean
): Promise<LeadWithPhoto> {
  const lead = await leadRepositories.setLeadDoNotContact(id, doNotContact);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
