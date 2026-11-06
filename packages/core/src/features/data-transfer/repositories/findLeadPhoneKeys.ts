import { db, isNotNull, leadsTable } from "@vetra/database";

export async function findLeadPhoneKeys(): Promise<string[]> {
  const rows = await db.select({ phoneKey: leadsTable.phoneKey }).from(leadsTable);

  return rows.map((row) => row.phoneKey);
}

export async function findLeadSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: leadsTable.slug })
    .from(leadsTable)
    .where(isNotNull(leadsTable.slug));

  return rows.flatMap((row) => (row.slug === null ? [] : [row.slug]));
}
