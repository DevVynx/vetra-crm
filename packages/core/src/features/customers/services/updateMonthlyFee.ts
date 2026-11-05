import { customerRepositories } from "../repositories";
import { ensureCustomerExists } from "./ensureCustomerExists";

export async function updateMonthlyFee(
  customerId: string,
  monthlyFeeInCents: number | null
): Promise<void> {
  await ensureCustomerExists(customerId);

  await customerRepositories.updateMonthlyFee(customerId, monthlyFeeInCents);
}
