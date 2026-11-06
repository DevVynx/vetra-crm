import { completedActionsTable, db, eq, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

// Undo of a completion: the history row goes and the pending action comes back, together. As in
// completing, the delete decides, so a second request for the same action answers false.
export async function reopenCompletedAction(action: NextAction): Promise<boolean> {
  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(completedActionsTable)
      .where(eq(completedActionsTable.id, action.id))
      .returning({ id: completedActionsTable.id });
    if (deleted.length === 0) return false;

    await tx.insert(nextActionsTable).values(action);
    return true;
  });
}
