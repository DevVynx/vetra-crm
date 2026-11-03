import { type Database, db, stagesTable, type Transaction } from "@vetra/database";

import type { Stage } from "../domain";

// Upserts the whole stage layout, so a create or a reorder lands in one transaction.
export async function saveStages(
  stages: Stage[],
  executor: Database | Transaction = db
): Promise<void> {
  await executor.transaction(async (tx) => {
    for (const stage of stages) {
      await tx
        .insert(stagesTable)
        .values(stage)
        .onConflictDoUpdate({
          target: stagesTable.id,
          set: { name: stage.name, color: stage.color, position: stage.position },
        });
    }
  });
}
