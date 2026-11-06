import { db, eq, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

export async function updateNextAction(
  { id, type, followUpStep, description, body, dueAt }: NextAction,
  { textChanged }: { textChanged: boolean }
): Promise<void> {
  await db
    .update(nextActionsTable)
    .set({
      type,
      followUpStep,
      description,
      body,
      dueAt,
      sendAttempts: 0,
      sendError: null,
      ...(textChanged ? { sendBlocksDone: 0 } : {}),
    })
    .where(eq(nextActionsTable.id, id));
}
