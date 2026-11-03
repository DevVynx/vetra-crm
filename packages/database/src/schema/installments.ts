import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";
import { projectsTable } from "./projects";

// The customer's revenue: paid when paid_at is set, pending otherwise.
export const installmentsTable = pgTable(
  "installments",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    projectId: text().references(() => projectsTable.id, { onDelete: "set null" }),
    description: text().notNull(),
    amountInCents: integer().notNull(),
    dueAt: instantColumn("due_at").notNull(),
    paidAt: instantColumn("paid_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("installments_lead_id_idx").on(table.leadId),
    index("installments_project_id_idx").on(table.projectId),
    index("installments_due_at_idx").on(table.dueAt),
    index("installments_paid_at_idx").on(table.paidAt),
  ]
);
