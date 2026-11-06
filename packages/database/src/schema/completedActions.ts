import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { instantColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";
import { nextActionTypeEnum } from "./nextActions";

// What was done, kept: a next action is deleted when it is completed, and a copy of it stays here,
// with the moment it was completed. Nothing reads it yet; it is the history for later features.
export const completedActionsTable = pgTable(
  "completed_actions",
  {
    // The id the action had while it was pending.
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    type: nextActionTypeEnum().notNull(),
    followUpStep: integer(),
    description: text().notNull(),
    dueAt: instantColumn("due_at").notNull(),
    completedAt: instantColumn("completed_at").notNull(),
  },
  (table) => [
    index("completed_actions_lead_id_idx").on(table.leadId),
    index("completed_actions_completed_at_idx").on(table.completedAt),
  ]
);
