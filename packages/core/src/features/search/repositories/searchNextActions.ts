import { and, asc, db, eq, inArray, leadsTable, nextActionsTable, sql } from "@vetra/database";

import { containsSql } from "../../../shared/filters";
import type { OwnedHit } from "../domain";

export async function searchNextActions(
  term: string,
  visibleStageIds: string[],
  limit: number
): Promise<OwnedHit[]> {
  return db
    .select({
      id: nextActionsTable.id,
      text: nextActionsTable.description,
      ownerId: leadsTable.id,
      ownerBusinessName: leadsTable.businessName,
    })
    .from(nextActionsTable)
    .innerJoin(leadsTable, eq(leadsTable.id, nextActionsTable.leadId))
    .where(
      and(
        inArray(leadsTable.stageId, visibleStageIds),
        containsSql(sql`${nextActionsTable.description}`, term)
      )
    )
    .orderBy(asc(nextActionsTable.dueAt), asc(nextActionsTable.id))
    .limit(limit);
}
