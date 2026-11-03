import { and, db, expensesTable, installmentsTable, projectsTable, sql } from "@vetra/database";

import { type Filter, type FilterColumns, filtersToSql } from "../../../shared/filters";
import type { LedgerEntryWithProject } from "../domain";

// Installments read as revenue entries and expenses as expense entries, in one shape.
const ledgerSql = sql`(
  SELECT ${installmentsTable.id} AS id, ${installmentsTable.leadId} AS lead_id,
    'revenue' AS type, ${installmentsTable.description} AS description,
    ${installmentsTable.amountInCents} AS amount_in_cents,
    CASE WHEN ${installmentsTable.paidAt} IS NULL THEN 'pending' ELSE 'confirmed' END AS status,
    COALESCE(${installmentsTable.paidAt}, ${installmentsTable.dueAt}) AS occurred_at,
    ${installmentsTable.createdAt} AS created_at, ${installmentsTable.projectId} AS project_id
  FROM ${installmentsTable}
  UNION ALL
  SELECT ${expensesTable.id}, ${expensesTable.leadId}, 'expense', ${expensesTable.description},
    ${expensesTable.amountInCents}, ${expensesTable.status}::text, ${expensesTable.occurredAt},
    ${expensesTable.createdAt}, ${expensesTable.projectId}
  FROM ${expensesTable}
) AS ledger`;

// The "project" filter uses this value for entries without a project.
const NO_PROJECT = "none";

const ledgerFilterColumns: FilterColumns = {
  type: { kind: "select", expression: sql`ledger.type` },
  status: { kind: "select", expression: sql`ledger.status` },
  project: { kind: "select", expression: sql`COALESCE(ledger.project_id, ${NO_PROJECT})` },
  amount: { kind: "number", expression: sql`ledger.amount_in_cents` },
  date: { kind: "date", expression: sql`ledger.occurred_at` },
};

type LedgerRow = {
  id: string;
  lead_id: string;
  type: LedgerEntryWithProject["type"];
  description: string;
  amount_in_cents: number;
  status: LedgerEntryWithProject["status"];
  occurred_at: string | Date;
  created_at: string | Date;
  project_id: string | null;
  project_name: string | null;
};

type findLedgerEntriesInput = {
  leadId: string;
  entryId?: string;
  filters?: Filter[];
  timeZone?: string;
};

// Newest first. Raw rows may carry timestamps as strings, so they are turned into dates here.
export async function findLedgerEntries({
  leadId,
  entryId,
  filters = [],
  timeZone = "UTC",
}: findLedgerEntriesInput): Promise<LedgerEntryWithProject[]> {
  const where = and(
    sql`ledger.lead_id = ${leadId}`,
    entryId ? sql`ledger.id = ${entryId}` : undefined,
    filtersToSql(filters, ledgerFilterColumns, timeZone)
  );

  const { rows } = await db.execute<LedgerRow>(sql`
    SELECT ledger.*, ${projectsTable.name} AS project_name
    FROM ${ledgerSql}
    LEFT JOIN ${projectsTable} ON ${projectsTable.id} = ledger.project_id
    WHERE ${where}
    ORDER BY ledger.occurred_at DESC, ledger.id
  `);

  return rows.map((row: LedgerRow) => ({
    id: row.id,
    leadId: row.lead_id,
    type: row.type,
    description: row.description,
    amountInCents: Number(row.amount_in_cents),
    status: row.status,
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
    projectId: row.project_id,
    projectName: row.project_name,
  }));
}
