import type { Lead, LeadContact } from "../../leads/domain";
import { getLead } from "../../leads/services/getLead";
import { CustomerNotFoundError } from "../errors";
import { customerRepositories } from "../repositories";

export async function updateCustomer(
  id: string,
  contact: LeadContact,
  document: string | null
): Promise<Lead> {
  if (!(await customerRepositories.findCustomerById(id))) throw new CustomerNotFoundError();

  await customerRepositories.updateCustomerProfile(id, contact, document);
  return getLead(id);
}
