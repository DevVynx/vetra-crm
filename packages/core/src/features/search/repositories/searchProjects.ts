import { asc, db, dealsTable, eq, leadsTable, projectsTable, sql } from "@vetra/database";

import { containsSql } from "../../../shared/filters";
import type { OwnedHit } from "../domain";

// Projects belong to customers, so they are reached through the deal.
export async function searchProjects(term: string, limit: number): Promise<OwnedHit[]> {
  return db
    .select({
      id: projectsTable.id,
      text: projectsTable.name,
      ownerId: leadsTable.id,
      ownerBusinessName: leadsTable.businessName,
    })
    .from(projectsTable)
    .innerJoin(leadsTable, eq(leadsTable.id, projectsTable.leadId))
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(containsSql(sql`${projectsTable.name}`, term))
    .orderBy(sql`unaccent(lower(${projectsTable.name}))`, asc(projectsTable.id))
    .limit(limit);
}
