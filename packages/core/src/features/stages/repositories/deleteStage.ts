import { db, eq, stagesTable } from "@vetra/database";

import { leadRepositories } from "../../leads/repositories";
import type { Stage } from "../domain";
import { saveStages } from "./saveStages";

// Moving the leads, removing the stage and renumbering the rest succeed or fail together.
export async function deleteStage(id: string, targetId: string, remaining: Stage[]): Promise<void> {
  await db.transaction(async (tx) => {
    await leadRepositories.moveLeadsToStage(tx, id, targetId);
    await tx.delete(stagesTable).where(eq(stagesTable.id, id));
    await saveStages(remaining, tx);
  });
}
