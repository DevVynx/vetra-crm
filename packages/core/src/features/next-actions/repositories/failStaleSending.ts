import { and, db, isNotNull, lt, nextActionsTable } from "@vetra/database";

// A send that began and never ended (the server stopped in the middle of it) may or may not have
// gone out. It is never sent again by itself, since that could repeat a message: it is freed, marked
// as interrupted and out of the automatic attempts, for the user to look at the conversation.
export async function failStaleSending(before: Date, maxAttempts: number): Promise<number> {
  const failed = await db
    .update(nextActionsTable)
    .set({ sendingSince: null, sendError: "interrupted", sendAttempts: maxAttempts })
    .where(and(isNotNull(nextActionsTable.sendingSince), lt(nextActionsTable.sendingSince, before)))
    .returning({ id: nextActionsTable.id });

  return failed.length;
}
