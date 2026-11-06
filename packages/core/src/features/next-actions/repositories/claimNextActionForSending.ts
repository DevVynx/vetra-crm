import { and, db, eq, isNull, nextActionsTable } from "@vetra/database";

// Of two requests for the same action, only one gets it: the update finds the row free only once.
export async function claimNextActionForSending(id: string, now: Date): Promise<boolean> {
  const claimed = await db
    .update(nextActionsTable)
    .set({ sendingSince: now })
    .where(and(eq(nextActionsTable.id, id), isNull(nextActionsTable.sendingSince)))
    .returning({ id: nextActionsTable.id });

  return claimed.length > 0;
}
