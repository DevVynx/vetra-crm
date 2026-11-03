import { and, count, db, installmentsTable, isNotNull } from "@vetra/database";

import type { DateRange } from "../domain";
import { sumOf, within } from "./summarySql";

// Money received in the range: installments paid within it.
export async function sumPayments(range: DateRange | null) {
  const [row] = await db
    .select({ amountInCents: sumOf(installmentsTable.amountInCents), count: count() })
    .from(installmentsTable)
    .where(and(isNotNull(installmentsTable.paidAt), within(installmentsTable.paidAt, range)));
  return row ?? { amountInCents: 0, count: 0 };
}
