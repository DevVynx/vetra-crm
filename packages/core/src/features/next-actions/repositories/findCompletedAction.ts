import { completedActionsTable, db, eq } from "@vetra/database";

import type { CompletedAction } from "../domain";

export async function findCompletedAction(id: string): Promise<CompletedAction | undefined> {
  const [completed] = await db
    .select()
    .from(completedActionsTable)
    .where(eq(completedActionsTable.id, id));

  return completed;
}
