import { db, eq, leadNotesTable } from "@vetra/database";

export async function deleteLeadNote(id: string): Promise<boolean> {
  const deleted = await db
    .delete(leadNotesTable)
    .where(eq(leadNotesTable.id, id))
    .returning({ id: leadNotesTable.id });
  return deleted.length > 0;
}
