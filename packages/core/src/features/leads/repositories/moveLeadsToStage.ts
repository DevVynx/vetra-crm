import { type Database, eq, leadsTable, type Transaction } from "@vetra/database";

// Runs inside the caller's transaction: it is one step of deleting a stage.
export async function moveLeadsToStage(
  executor: Database | Transaction,
  fromStageId: string,
  toStageId: string
): Promise<void> {
  await executor
    .update(leadsTable)
    .set({ stageId: toStageId })
    .where(eq(leadsTable.stageId, fromStageId));
  await executor
    .update(leadsTable)
    .set({ stoppedAtStageId: toStageId })
    .where(eq(leadsTable.stoppedAtStageId, fromStageId));
}
