import { db, stagesTable } from "@vetra/database";

import type { Stage } from "../domain";

export async function findStages(): Promise<Stage[]> {
  return db
    .select({
      id: stagesTable.id,
      name: stagesTable.name,
      color: stagesTable.color,
      role: stagesTable.role,
      position: stagesTable.position,
    })
    .from(stagesTable);
}
