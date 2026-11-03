import { count, db, dealsTable } from "@vetra/database";

import type { DateRange } from "../domain";
import { sumOf, within } from "./summarySql";

// Sales in the range: deals closed within it, at their closed value.
export async function sumSales(range: DateRange | null) {
  const [row] = await db
    .select({ amountInCents: sumOf(dealsTable.closedValueInCents), count: count() })
    .from(dealsTable)
    .where(within(dealsTable.closedAt, range));
  return row ?? { amountInCents: 0, count: 0 };
}
