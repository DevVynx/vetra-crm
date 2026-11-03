import { db, eq, leadsTable } from "@vetra/database";

// Notes and next actions go with the lead (cascade).
export async function deleteLead(id: string): Promise<void> {
  await db.delete(leadsTable).where(eq(leadsTable.id, id));
}
