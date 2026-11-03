import { db, eq, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

export async function updateNextAction({
  id,
  type,
  followUpStep,
  description,
  dueAt,
}: NextAction): Promise<void> {
  await db
    .update(nextActionsTable)
    .set({ type, followUpStep, description, dueAt })
    .where(eq(nextActionsTable.id, id));
}
