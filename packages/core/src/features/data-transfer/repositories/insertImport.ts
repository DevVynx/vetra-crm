import {
  db,
  dealsTable,
  expensesTable,
  installmentsTable,
  leadNotesTable,
  leadsTable,
  nextActionsTable,
  projectsTable,
} from "@vetra/database";

import type { ImportRecords } from "../helpers/planImport";

// A statement has a limit of parameters, so a long list goes in pieces.
const ROWS_PER_INSERT = 500;

function inChunks<Row>(rows: Row[]): Row[][] {
  const chunks: Row[][] = [];
  for (let start = 0; start < rows.length; start += ROWS_PER_INSERT) {
    chunks.push(rows.slice(start, start + ROWS_PER_INSERT));
  }

  return chunks;
}

// All of it or none of it: if the database refuses any row, nothing of the import stays.
export async function insertImport(records: ImportRecords): Promise<void> {
  await db.transaction(async (tx) => {
    for (const rows of inChunks(records.leads)) await tx.insert(leadsTable).values(rows);
    for (const rows of inChunks(records.deals)) await tx.insert(dealsTable).values(rows);
    for (const rows of inChunks(records.projects)) await tx.insert(projectsTable).values(rows);
    for (const rows of inChunks(records.installments)) {
      await tx.insert(installmentsTable).values(rows);
    }
    for (const rows of inChunks(records.expenses)) await tx.insert(expensesTable).values(rows);
    for (const rows of inChunks(records.notes)) await tx.insert(leadNotesTable).values(rows);
    for (const rows of inChunks(records.nextActions)) {
      await tx.insert(nextActionsTable).values(rows);
    }
  });
}
