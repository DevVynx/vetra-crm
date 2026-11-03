import { count, db, inArray, leadsTable } from "@vetra/database";

export async function countLeadsInStages(stageIds: string[]): Promise<number> {
  if (stageIds.length === 0) return 0;
  const [row] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(inArray(leadsTable.stageId, stageIds));
  return row?.count ?? 0;
}
