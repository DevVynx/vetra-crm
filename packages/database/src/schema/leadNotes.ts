import { index, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

export const leadNotesTable = pgTable(
  "lead_notes",
  {
    id: uuidPrimaryKeyColumn(),
    leadId: text()
      .notNull()
      .references(() => leadsTable.id, { onDelete: "cascade" }),
    content: text().notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [index("lead_notes_lead_id_idx").on(table.leadId)]
);
