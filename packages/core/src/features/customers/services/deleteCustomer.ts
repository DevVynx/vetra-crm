import { leadRepositories } from "../../leads/repositories";
import { CustomerNotFoundError } from "../errors";
import { customerRepositories } from "../repositories";

// Deleting the lead takes everything of the customer with it (cascade): deal, installments,
// expenses, projects, notes and next actions.
export async function deleteCustomer(id: string): Promise<void> {
  if (!(await customerRepositories.findCustomerById(id))) throw new CustomerNotFoundError();

  await leadRepositories.deleteLead(id);
}
