import type { Lead, LeadContact } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";

export async function updateLead(id: string, contact: LeadContact): Promise<Lead> {
  const lead = await leadRepositories.updateLeadContact(id, contact);
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
