import { asc, db, inArray, leadsTable } from "@vetra/database";

type field = "niche" | "city";

export async function findLeadFieldValues(
  field: field,
  visibleStageIds: string[]
): Promise<string[]> {
  const column = leadsTable[field];
  const rows = await db
    .selectDistinct({ value: column })
    .from(leadsTable)
    .where(inArray(leadsTable.stageId, visibleStageIds))
    .orderBy(asc(column));
  return rows.map((row) => row.value);
}
