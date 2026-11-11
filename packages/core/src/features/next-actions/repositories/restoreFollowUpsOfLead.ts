import { and, db, eq, nextActionsTable, queuedFollowUpsTable } from "@vetra/database";

import type { FollowUpsSnapshot } from "../domain";

// Undo of cancelling a lead's follow-ups: the pending ones come back with their ids, and the queue goes back to
// the state it was in. An action that exists already is left as it is.
export async function restoreFollowUpsOfLead(
  leadId: string,
  { actions, queue }: FollowUpsSnapshot
): Promise<void> {
  await db.transaction(async (tx) => {
    if (actions.length > 0) {
      await tx.insert(nextActionsTable).values(actions).onConflictDoNothing();
    }

    for (const { id, status, scheduledActionId, scheduledByActionId } of queue) {
      await tx
        .update(queuedFollowUpsTable)
        .set({ status, scheduledActionId, scheduledByActionId })
        .where(and(eq(queuedFollowUpsTable.id, id), eq(queuedFollowUpsTable.leadId, leadId)));
    }
  });
}
