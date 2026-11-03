import { type Database, dealsTable, installmentsTable, type Transaction } from "@vetra/database";

import type { Deal, Installment } from "../domain";

// Runs inside the caller's transaction: it is one step of closing a lead or creating a customer.
export async function insertDeal(
  executor: Database | Transaction,
  deal: Deal,
  installments: Installment[]
): Promise<void> {
  await executor.insert(dealsTable).values(deal);
  if (installments.length > 0) await executor.insert(installmentsTable).values(installments);
}
