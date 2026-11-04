import { and, db, desc, eq, inArray, leadNotesTable, leadsTable, sql } from "@vetra/database";

import { containsSql } from "../../../shared/filters";
import type { OwnedHit } from "../domain";

export async function searchNotes(
  term: string,
  visibleStageIds: string[],
  limit: number
): Promise<OwnedHit[]> {
  return db
    .select({
      id: leadNotesTable.id,
      text: leadNotesTable.content,
      ownerId: leadsTable.id,
      ownerBusinessName: leadsTable.businessName,
    })
    .from(leadNotesTable)
    .innerJoin(leadsTable, eq(leadsTable.id, leadNotesTable.leadId))
    .where(
      and(
        inArray(leadsTable.stageId, visibleStageIds),
        containsSql(sql`${leadNotesTable.content}`, term)
      )
    )
    .orderBy(desc(leadNotesTable.createdAt), desc(leadNotesTable.id))
    .limit(limit);
}
