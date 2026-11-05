import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { stagesTable } from "./stages";

export const leadsTable = pgTable(
  "leads",
  {
    id: uuidPrimaryKeyColumn(),
    businessName: text().notNull(),
    contactName: text(),
    niche: text().notNull(),
    city: text().notNull(),
    phone: text().notNull(),
    // The number in the form that compares equal with and without the ninth digit; see VET-12.md.
    phoneKey: text().notNull(),
    email: text(),
    demoUrl: text(),
    stageId: text()
      .notNull()
      .references(() => stagesTable.id, { onDelete: "restrict" }),
    stoppedAtStageId: text().references(() => stagesTable.id, { onDelete: "restrict" }),
    stageChangedAt: instantColumn("stage_changed_at").notNull(),
    prospectedAt: instantColumn("prospected_at").notNull(),
    // Only messages move it, and only forward.
    lastContactAt: instantColumn("last_contact_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("leads_phone_key_idx").on(table.phoneKey),
    index("leads_stage_id_idx").on(table.stageId),
    index("leads_stopped_at_stage_id_idx").on(table.stoppedAtStageId),
    index("leads_niche_idx").on(table.niche),
    index("leads_city_idx").on(table.city),
    index("leads_prospected_at_idx").on(table.prospectedAt),
  ]
);
