import { and, count, db, dealsTable, eq, gte, leadsTable, lte } from "@vetra/database";

import type { DateRange, NicheConversion } from "../domain";

// Per niche, the leads prospected in the range and how many of them became customers.
export async function findNicheConversion(range: DateRange | null): Promise<NicheConversion[]> {
  return db
    .select({
      niche: leadsTable.niche,
      prospectedCount: count(),
      wonCount: count(dealsTable.id),
    })
    .from(leadsTable)
    .leftJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(
      range
        ? and(gte(leadsTable.prospectedAt, range.start), lte(leadsTable.prospectedAt, range.end))
        : undefined
    )
    .groupBy(leadsTable.niche);
}
