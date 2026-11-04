import { and, asc, db, inArray, leadsTable, sql } from "@vetra/database";

import { leadSearchSql } from "../../leads/repositories/leadListWhere";
import type { LeadHit } from "../domain";

export async function searchLeads(
  term: string,
  visibleStageIds: string[],
  limit: number
): Promise<LeadHit[]> {
  return db
    .select({
      id: leadsTable.id,
      businessName: leadsTable.businessName,
      contactName: leadsTable.contactName,
      niche: leadsTable.niche,
      city: leadsTable.city,
    })
    .from(leadsTable)
    .where(and(inArray(leadsTable.stageId, visibleStageIds), leadSearchSql(term)))
    .orderBy(sql`unaccent(lower(${leadsTable.businessName}))`, asc(leadsTable.id))
    .limit(limit);
}
