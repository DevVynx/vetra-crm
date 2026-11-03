import { db, eq, leadsTable } from "@vetra/database";

import { nextActionRepositories } from "../../next-actions/repositories";
import type { LeadStageState } from "../domain";

// Writes every stage change together and drops the pending actions of the archived leads.
export async function saveLeadStages(
  states: LeadStageState[],
  archivedLeadIds: string[]
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const { id, stageId, stoppedAtStageId, stageChangedAt } of states) {
      await tx
        .update(leadsTable)
        .set({ stageId, stoppedAtStageId, stageChangedAt })
        .where(eq(leadsTable.id, id));
    }
    await nextActionRepositories.deleteNextActionsOfLeads(tx, archivedLeadIds);
  });
}
