import { and, db, eq, isNull, ne, nextActionsTable, queuedFollowUpsTable } from "@vetra/database";

import type { FollowUpsSnapshot } from "../domain";

// The user ending a lead's follow-ups: the pending ones go and the queue is cancelled, like after a reply, but
// what was removed is handed back so it can be put back. One being sent right now is left alone.
export async function cancelFollowUpsOfLead(leadId: string): Promise<FollowUpsSnapshot> {
  return db.transaction(async (tx) => {
    const actions = await tx
      .delete(nextActionsTable)
      .where(
        and(
          eq(nextActionsTable.leadId, leadId),
          eq(nextActionsTable.type, "follow_up"),
          isNull(nextActionsTable.sendingSince)
        )
      )
      .returning({
        id: nextActionsTable.id,
        leadId: nextActionsTable.leadId,
        type: nextActionsTable.type,
        followUpStep: nextActionsTable.followUpStep,
        description: nextActionsTable.description,
        body: nextActionsTable.body,
        dueAt: nextActionsTable.dueAt,
      });

    const stillOpen = and(
      eq(queuedFollowUpsTable.leadId, leadId),
      ne(queuedFollowUpsTable.status, "cancelled")
    );
    const queue = await tx
      .select({
        id: queuedFollowUpsTable.id,
        status: queuedFollowUpsTable.status,
        scheduledActionId: queuedFollowUpsTable.scheduledActionId,
        scheduledByActionId: queuedFollowUpsTable.scheduledByActionId,
      })
      .from(queuedFollowUpsTable)
      .where(stillOpen);
    await tx.update(queuedFollowUpsTable).set({ status: "cancelled" }).where(stillOpen);

    return { actions, queue };
  });
}
