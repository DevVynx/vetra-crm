import { db, leadsTable } from "@vetra/database";

export async function findLeadPhoneKeys(): Promise<string[]> {
  const rows = await db.select({ phoneKey: leadsTable.phoneKey }).from(leadsTable);

  return rows.map((row) => row.phoneKey);
}
