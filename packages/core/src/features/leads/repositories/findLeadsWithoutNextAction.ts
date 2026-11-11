import {
  and,
  count,
  db,
  inArray,
  leadsTable,
  nextActionsTable,
  qualified,
  sql,
} from "@vetra/database";

import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

// The longest-waiting first: the ones just prospected have not had time to get an action yet.
export async function findLeadsWithoutNextAction(
  stageIds: string[],
  limit: number
): Promise<{ items: Lead[]; total: number }> {
  const where = and(
    inArray(leadsTable.stageId, stageIds),
    sql`NOT EXISTS (SELECT 1 FROM ${nextActionsTable} WHERE ${nextActionsTable.leadId} = ${qualified(leadsTable.id)})`
  );

  const [items, [totalRow]] = await Promise.all([
    db
      .select(leadColumns)
      .from(leadsTable)
      .where(where)
      .orderBy(leadsTable.prospectedAt, leadsTable.id)
      .limit(limit),
    db.select({ total: count() }).from(leadsTable).where(where),
  ]);

  return { items, total: totalRow?.total ?? 0 };
}
