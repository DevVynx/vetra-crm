import { db, expensesTable, installmentsTable } from "@vetra/database";

import { ledgerDomain, type LedgerEntry } from "../domain";

// Inserts or updates the entry in the table of its type, keeping id and created_at as given.
export async function saveLedgerEntry(entry: LedgerEntry): Promise<void> {
  const { id, leadId, description, amountInCents, projectId, createdAt } = entry;

  if (entry.type === "revenue") {
    const { dueAt, paidAt } = ledgerDomain.installmentDatesOf(entry);
    const changes = { description, amountInCents, projectId, dueAt, paidAt };
    await db
      .insert(installmentsTable)
      .values({ id, leadId, createdAt, ...changes })
      .onConflictDoUpdate({ target: installmentsTable.id, set: changes });
    return;
  }

  const changes = {
    description,
    amountInCents,
    projectId,
    status: entry.status,
    occurredAt: entry.occurredAt,
  };
  await db
    .insert(expensesTable)
    .values({ id, leadId, createdAt, ...changes })
    .onConflictDoUpdate({ target: expensesTable.id, set: changes });
}
