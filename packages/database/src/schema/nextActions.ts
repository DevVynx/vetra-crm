import { index, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

export const nextActionTypeEnum = pgEnum("next_action_type", [
  "first_approach",
  "follow_up",
  "meeting",
  "proposal",
  "custom",
]);

// Only pending actions are stored: completing one deletes it and schedules the next.
export const nextActionsTable = pgTable(
  "next_actions",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    type: nextActionTypeEnum().notNull(),
    followUpStep: integer(),
    description: text().notNull(),
    // The text to use when doing it (a message to send); the description stays a one-line title.
    body: text(),
    dueAt: instantColumn("due_at").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("next_actions_lead_id_idx").on(table.leadId),
    index("next_actions_due_at_idx").on(table.dueAt),
  ]
);
