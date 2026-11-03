import { and, db, desc, inArray, leadsTable, nextActionsTable, sql } from "@vetra/database";

import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

export async function findLeadsWithoutNextAction(stageIds: string[]): Promise<Lead[]> {
  return db
    .select(leadColumns)
    .from(leadsTable)
    .where(
      and(
        inArray(leadsTable.stageId, stageIds),
        sql`NOT EXISTS (SELECT 1 FROM ${nextActionsTable} WHERE ${nextActionsTable.leadId} = ${leadsTable.id})`
      )
    )
    .orderBy(desc(leadsTable.prospectedAt));
}
