import { completedActionsTable, db, eq, nextActionsTable } from "@vetra/database";

import type { CompletedAction, NextAction } from "../domain";

// Completing: the done action leaves the pending ones and stays as history, and the next one
// arrives, all together.
export async function replaceNextAction(
  completed: CompletedAction,
  next: NextAction
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(completedActionsTable).values(completed);
    await tx.delete(nextActionsTable).where(eq(nextActionsTable.id, completed.id));
    await tx.insert(nextActionsTable).values(next);
  });
}
