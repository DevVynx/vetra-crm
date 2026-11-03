import type { Lead, LeadContact } from "../../leads/domain";
import { getLead } from "../../leads/services/getLead";
import { customerRepositories } from "../repositories";
import { ensureCustomerExists } from "./ensureCustomerExists";

export async function updateCustomer(
  id: string,
  contact: LeadContact,
  document: string | null
): Promise<Lead> {
  await ensureCustomerExists(id);

  await customerRepositories.updateCustomerProfile(id, contact, document);
  return getLead(id);
}
