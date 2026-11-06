import { db, nextActionsTable } from "@vetra/database";

export async function findAllNextActions() {
  return db.select().from(nextActionsTable).orderBy(nextActionsTable.createdAt);
}
