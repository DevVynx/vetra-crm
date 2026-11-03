import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

// A customer is a lead with a deal: the deal holds what only exists after closing.
export const dealsTable = pgTable("deals", {
  id: uuidPrimaryKeyColumn(),
  leadId: text()
    .notNull()
    .unique()
    .references(() => leadsTable.id, { onDelete: "cascade" }),
  closedAt: instantColumn("closed_at").notNull(),
  closedValueInCents: integer().notNull(),
  document: text(),
  // No screen sets it yet; only the seed fills it.
  monthlyFeeInCents: integer(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
