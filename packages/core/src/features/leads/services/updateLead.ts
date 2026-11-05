import type { LeadFields, LeadWithPhoto } from "../domain";
import { LeadNotFoundError } from "../errors";
import { leadRepositories } from "../repositories";
import { ensurePhoneIsAvailable, withUniquePhone } from "./ensurePhoneIsAvailable";

export async function updateLead(id: string, fields: LeadFields): Promise<LeadWithPhoto> {
  await ensurePhoneIsAvailable(fields.phone, id);

  const lead = await withUniquePhone(() => leadRepositories.updateLeadContact(id, fields));
  if (!lead) throw new LeadNotFoundError();

  return lead;
}
