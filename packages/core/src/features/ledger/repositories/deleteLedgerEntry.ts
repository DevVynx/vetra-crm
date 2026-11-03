import { and, db, eq, expensesTable, installmentsTable } from "@vetra/database";

export async function deleteLedgerEntry(leadId: string, entryId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const installments = await tx
      .delete(installmentsTable)
      .where(and(eq(installmentsTable.id, entryId), eq(installmentsTable.leadId, leadId)))
      .returning({ id: installmentsTable.id });
    const expenses = await tx
      .delete(expensesTable)
      .where(and(eq(expensesTable.id, entryId), eq(expensesTable.leadId, leadId)))
      .returning({ id: expensesTable.id });
    return installments.length + expenses.length > 0;
  });
}
