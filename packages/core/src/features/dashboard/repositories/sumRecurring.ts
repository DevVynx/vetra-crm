import { count, db, dealsTable, isNotNull } from "@vetra/database";

import { sumOf } from "./summarySql";

export async function sumRecurring() {
  const [row] = await db
    .select({ monthlyAmountInCents: sumOf(dealsTable.monthlyFeeInCents), count: count() })
    .from(dealsTable)
    .where(isNotNull(dealsTable.monthlyFeeInCents));
  return row ?? { monthlyAmountInCents: 0, count: 0 };
}
