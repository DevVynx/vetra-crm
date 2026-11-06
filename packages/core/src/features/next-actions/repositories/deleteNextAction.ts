import { db, eq, nextActionsTable } from "@vetra/database";

export async function deleteNextAction(id: string): Promise<boolean> {
  const deleted = await db
    .delete(nextActionsTable)
    .where(eq(nextActionsTable.id, id))
    .returning({ id: nextActionsTable.id });

  return deleted.length > 0;
}
