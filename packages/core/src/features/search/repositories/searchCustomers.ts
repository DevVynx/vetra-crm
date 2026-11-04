import { asc, db, dealsTable, eq, leadsTable, sql } from "@vetra/database";

import { leadSearchSql } from "../../leads/repositories/leadListWhere";
import type { LeadHit } from "../domain";

export async function searchCustomers(term: string, limit: number): Promise<LeadHit[]> {
  return db
    .select({
      id: leadsTable.id,
      businessName: leadsTable.businessName,
      contactName: leadsTable.contactName,
      niche: leadsTable.niche,
      city: leadsTable.city,
    })
    .from(leadsTable)
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(leadSearchSql(term))
    .orderBy(sql`unaccent(lower(${leadsTable.businessName}))`, asc(leadsTable.id))
    .limit(limit);
}
