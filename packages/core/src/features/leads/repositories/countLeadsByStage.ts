import { count, db, leadsTable } from "@vetra/database";

export async function countLeadsByStage(): Promise<Record<string, number>> {
  const rows = await db
    .select({ stageId: leadsTable.stageId, total: count() })
    .from(leadsTable)
    .groupBy(leadsTable.stageId);
  return Object.fromEntries(rows.map((row) => [row.stageId, row.total]));
}
