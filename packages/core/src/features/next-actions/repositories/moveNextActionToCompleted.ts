import { completedActionsTable, db, eq, nextActionsTable } from "@vetra/database";

import type { CompletedAction } from "../domain";

// Completing: the done action leaves the pending ones and stays as history, together. The delete
// goes first and decides: of two requests for the same action, only one finds it to delete, and the
// other answers false instead of colliding with the history row of the first.
export async function moveNextActionToCompleted(completed: CompletedAction): Promise<boolean> {
  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(nextActionsTable)
      .where(eq(nextActionsTable.id, completed.id))
      .returning({ id: nextActionsTable.id });
    if (deleted.length === 0) return false;

    await tx.insert(completedActionsTable).values(completed);
    return true;
  });
}
