import { type Database, inArray, nextActionsTable, type Transaction } from "@vetra/database";

// Runs inside the caller's transaction: archiving a lead drops its pending actions.
export async function deleteNextActionsOfLeads(
  executor: Database | Transaction,
  leadIds: string[]
): Promise<void> {
  if (leadIds.length === 0) return;
  await executor.delete(nextActionsTable).where(inArray(nextActionsTable.leadId, leadIds));
}
