import { type Database, db, eq, leadsTable, type Transaction } from "@vetra/database";

import { nextActionRepositories } from "../../next-actions/repositories";
import type { LeadStageState } from "../domain";

// Writes every stage change together and drops the pending actions of the leads that leave
// the funnel (archived or closed). Runs inside the caller's transaction when given one.
export async function saveLeadStages(
  states: LeadStageState[],
  leadIdsLeavingFunnel: string[],
  executor: Database | Transaction = db
): Promise<void> {
  await executor.transaction(async (tx) => {
    for (const { id, stageId, stoppedAtStageId, stageChangedAt } of states) {
      await tx
        .update(leadsTable)
        .set({ stageId, stoppedAtStageId, stageChangedAt })
        .where(eq(leadsTable.id, id));
    }
    await nextActionRepositories.deleteNextActionsOfLeads(tx, leadIdsLeavingFunnel);
  });
}
