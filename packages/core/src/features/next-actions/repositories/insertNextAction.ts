import { db, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../domain";

export async function insertNextAction(action: NextAction): Promise<void> {
  await db.insert(nextActionsTable).values(action);
}
