import { completedActionsTable, db, eq, nextActionsTable } from "@vetra/database";

import type { CompletedAction } from "../domain";
import { scheduleNextQueuedFollowUp, startsNextFollowUp } from "./queuedFollowUps";

// Completing: the done action leaves the pending ones and stays as history, together. The delete
// goes first and decides: of two requests for the same action, only one finds it to delete, and the
// other answers false instead of colliding with the history row of the first.
//
// If this was the message that starts the next queued follow-up (VET-22), that one is made in the same step,
// due its wait after now.
export async function moveNextActionToCompleted(
  completed: CompletedAction,
  followUpWaitDays: number[]
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(nextActionsTable)
      .where(eq(nextActionsTable.id, completed.id))
      .returning({ id: nextActionsTable.id });
    if (deleted.length === 0) return false;

    await tx.insert(completedActionsTable).values(completed);
    if (await startsNextFollowUp(tx, completed)) {
      await scheduleNextQueuedFollowUp(tx, {
        leadId: completed.leadId,
        anchorAt: completed.completedAt,
        waitDays: followUpWaitDays,
        triggeredByActionId: completed.id,
      });
    }
    return true;
  });
}
