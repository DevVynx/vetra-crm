import { count, db, installmentsTable, isNull } from "@vetra/database";

import { sumOf } from "./summarySql";

// Every installment still unpaid, whatever its due date.
export async function sumReceivable() {
  const [row] = await db
    .select({ amountInCents: sumOf(installmentsTable.amountInCents), count: count() })
    .from(installmentsTable)
    .where(isNull(installmentsTable.paidAt));
  return row ?? { amountInCents: 0, count: 0 };
}
