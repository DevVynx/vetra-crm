import { db, eq, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

// Completing: the done action leaves and the next one arrives together.
export async function replaceNextAction(completedId: string, next: NextAction): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(nextActionsTable).where(eq(nextActionsTable.id, completedId));
    await tx.insert(nextActionsTable).values(next);
  });
}
