import { db, expensesTable } from "@vetra/database";

export async function findAllExpenses() {
  return db.select().from(expensesTable).orderBy(expensesTable.createdAt);
}
