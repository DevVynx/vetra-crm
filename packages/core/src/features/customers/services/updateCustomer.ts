import type { LeadContact, LeadWithPhoto } from "../../leads/domain";
import { ensurePhoneIsAvailable } from "../../leads/services/ensurePhoneIsAvailable";
import { getLead } from "../../leads/services/getLead";
import { customerRepositories } from "../repositories";
import { ensureCustomerExists } from "./ensureCustomerExists";

export async function updateCustomer(
  id: string,
  contact: LeadContact,
  document: string | null
): Promise<LeadWithPhoto> {
  await ensureCustomerExists(id);
  await ensurePhoneIsAvailable(contact.phone, id);

  await customerRepositories.updateCustomerProfile(id, contact, document);
  return getLead(id);
}
