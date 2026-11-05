import { db, eq, leadsTable } from "@vetra/database";

export async function findLeadIdByPhoneKey(phoneKey: string): Promise<string | null> {
  const [lead] = await db
    .select({ id: leadsTable.id })
    .from(leadsTable)
    .where(eq(leadsTable.phoneKey, phoneKey));

  return lead?.id ?? null;
}
