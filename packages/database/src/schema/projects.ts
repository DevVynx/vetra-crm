import { index, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

export const projectStatusEnum = pgEnum("project_status", ["in_production", "delivered"]);

export const projectsTable = pgTable(
  "projects",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    name: text().notNull(),
    status: projectStatusEnum().notNull(),
    valueInCents: integer().notNull(),
    startedAt: instantColumn("started_at").notNull(),
    deliveredAt: instantColumn("delivered_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [index("projects_lead_id_idx").on(table.leadId)]
);
