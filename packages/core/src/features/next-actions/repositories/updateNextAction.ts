import { db, eq, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

export async function updateNextAction({
  id,
  type,
  followUpStep,
  description,
  body,
  dueAt,
}: NextAction): Promise<void> {
  await db
    .update(nextActionsTable)
    .set({ type, followUpStep, description, body, dueAt })
    .where(eq(nextActionsTable.id, id));
}
