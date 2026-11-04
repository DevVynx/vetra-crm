import type { Lead, LeadFields } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function updateLead(id: string, fields: LeadFields): Promise<Lead> {
  const lead = await leadRepositories.updateLeadContact(id, fields);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
