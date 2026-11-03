import { index, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";
import { projectsTable } from "./projects";

export const expenseStatusEnum = pgEnum("expense_status", ["confirmed", "pending"]);

export const expensesTable = pgTable(
  "expenses",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    projectId: text().references(() => projectsTable.id, { onDelete: "set null" }),
    description: text().notNull(),
    amountInCents: integer().notNull(),
    status: expenseStatusEnum().notNull(),
    // When it was paid, or when it is due while still pending.
    occurredAt: instantColumn("occurred_at").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("expenses_lead_id_idx").on(table.leadId),
    index("expenses_project_id_idx").on(table.projectId),
    index("expenses_occurred_at_idx").on(table.occurredAt),
  ]
);
