import { customerRepositories } from "../repositories";

export async function listCustomerFieldValues(field: "niche" | "city"): Promise<string[]> {
  return customerRepositories.findCustomerFieldValues(field);
}
