import { db, eq, expensesTable, installmentsTable } from "@vetra/database";

// Ids are unique across both tables, whatever customer they belong to.
export async function ledgerEntryIdExists(id: string): Promise<boolean> {
  const [installments, expenses] = await Promise.all([
    db
      .select({ id: installmentsTable.id })
      .from(installmentsTable)
      .where(eq(installmentsTable.id, id)),
    db.select({ id: expensesTable.id }).from(expensesTable).where(eq(expensesTable.id, id)),
  ]);
  return installments.length + expenses.length > 0;
}
