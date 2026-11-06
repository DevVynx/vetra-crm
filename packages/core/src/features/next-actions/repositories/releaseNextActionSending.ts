import { db, eq, nextActionsTable, sql } from "@vetra/database";

// The send failed: it is free again, with why, and the automatic attempts count one more. A manual
// failure only records why.
export async function releaseNextActionSending(
  id: string,
  { error, countAttempt }: { error: string; countAttempt: boolean }
): Promise<void> {
  await db
    .update(nextActionsTable)
    .set({
      sendingSince: null,
      sendError: error,
      sendAttempts: countAttempt
        ? sql`${nextActionsTable.sendAttempts} + 1`
        : nextActionsTable.sendAttempts,
    })
    .where(eq(nextActionsTable.id, id));
}
