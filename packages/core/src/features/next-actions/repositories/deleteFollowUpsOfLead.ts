import { and, db, eq, isNull, nextActionsTable } from "@vetra/database";

// A follow-up being sent right now is left alone: it has already started, and deleting it would lose
// the progress of its blocks.
export async function deleteFollowUpsOfLead(leadId: string): Promise<void> {
  await db
    .delete(nextActionsTable)
    .where(
      and(
        eq(nextActionsTable.leadId, leadId),
        eq(nextActionsTable.type, "follow_up"),
        isNull(nextActionsTable.sendingSince)
      )
    );
}
