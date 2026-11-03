import { and, count, db, gte, leadsTable, lte, sql } from "@vetra/database";

import type { DateRange } from "../domain";

// Leads prospected in the range, grouped by the furthest stage they reached as far as we know:
// the stage they stopped at when archived, otherwise their current stage.
export async function countLeadsByFurthestStage(
  range: DateRange | null
): Promise<Map<string, number>> {
  const furthestStage = sql<string>`COALESCE(${leadsTable.stoppedAtStageId}, ${leadsTable.stageId})`;
  const rows = await db
    .select({ stageId: furthestStage, count: count() })
    .from(leadsTable)
    .where(
      range
        ? and(gte(leadsTable.prospectedAt, range.start), lte(leadsTable.prospectedAt, range.end))
        : undefined
    )
    .groupBy(furthestStage);

  return new Map(rows.map((row) => [row.stageId, row.count]));
}
