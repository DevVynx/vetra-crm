import { db, leadsTable } from "@vetra/database";

import { type LeadListScope, leadListWhere } from "./leadListWhere";

export async function findLeadIds(scope: LeadListScope): Promise<string[]> {
  const rows = await db.select({ id: leadsTable.id }).from(leadsTable).where(leadListWhere(scope));
  return rows.map((row) => row.id);
}
