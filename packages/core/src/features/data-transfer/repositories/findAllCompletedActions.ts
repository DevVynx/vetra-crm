import { completedActionsTable, db } from "@vetra/database";

export async function findAllCompletedActions() {
  return db.select().from(completedActionsTable).orderBy(completedActionsTable.completedAt);
}
