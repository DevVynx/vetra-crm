import { db, eq, nextActionsTable } from "@vetra/database";

// Each block that went is written down, so a retry continues after it and never repeats it.
export async function recordSendProgress(id: string, blocksDone: number): Promise<void> {
  await db
    .update(nextActionsTable)
    .set({ sendBlocksDone: blocksDone })
    .where(eq(nextActionsTable.id, id));
}
