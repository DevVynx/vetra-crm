import { db, stagesTable } from "@vetra/database";

export async function findAllStages() {
  return db.select().from(stagesTable).orderBy(stagesTable.position);
}
