import { leadRepositories } from "../../leads/repositories";
import { ensureCustomerExists } from "./ensureCustomerExists";

// Deleting the lead takes everything of the customer with it (cascade): deal, installments,
// expenses, projects, notes and next actions.
export async function deleteCustomer(id: string): Promise<void> {
  await ensureCustomerExists(id);

  await leadRepositories.deleteLead(id);
}
