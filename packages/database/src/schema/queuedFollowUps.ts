import { integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

export const queuedFollowUpStatusEnum = pgEnum("queued_follow_up_status", [
  "queued",
  "scheduled",
  "cancelled",
]);

// The follow-up texts the pipeline hands over with a lead (VET-22), kept until the previous message goes
// out and Vetra makes each one an activity. A row is never deleted when it is used or cancelled: its
// existence is how Vetra knows the lead already got its follow-ups from the pipeline.
export const queuedFollowUpsTable = pgTable(
  "queued_follow_ups",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    step: integer().notNull(),
    body: text().notNull(),
    status: queuedFollowUpStatusEnum().notNull().default("queued"),
    // The activity made from it, and the one whose completion made it, so undoing that completion can
    // put it back in the queue.
    scheduledActionId: text(),
    scheduledByActionId: text(),
    createdAt: createdAtColumn(),
  },
  (table) => [uniqueIndex("queued_follow_ups_lead_step_idx").on(table.leadId, table.step)]
);
