import { CustomerNotFoundError } from "../errors";
import { customerRepositories } from "../repositories";

export async function ensureCustomerExists(id: string): Promise<void> {
  if (!(await customerRepositories.findCustomerById(id))) throw new CustomerNotFoundError();
}
