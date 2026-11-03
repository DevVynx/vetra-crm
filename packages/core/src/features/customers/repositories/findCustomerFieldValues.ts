import { asc, db, dealsTable, eq, leadsTable } from "@vetra/database";

export async function findCustomerFieldValues(field: "niche" | "city"): Promise<string[]> {
  const column = leadsTable[field];
  const rows = await db
    .selectDistinct({ value: column })
    .from(leadsTable)
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .orderBy(asc(column));
  return rows.map((row) => row.value);
}
