import { index, pgTable, text } from "drizzle-orm/pg-core";

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
    email: text(),
    demoUrl: text(),
    stageId: text()
      .notNull()
      .references(() => stagesTable.id, { onDelete: "restrict" }),
    stoppedAtStageId: text().references(() => stagesTable.id, { onDelete: "restrict" }),
    stageChangedAt: instantColumn("stage_changed_at").notNull(),
    prospectedAt: instantColumn("prospected_at").notNull(),
    // Filled by the WhatsApp integration later; null until then.
    lastContactAt: instantColumn("last_contact_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("leads_stage_id_idx").on(table.stageId),
    index("leads_stopped_at_stage_id_idx").on(table.stoppedAtStageId),
    index("leads_niche_idx").on(table.niche),
    index("leads_city_idx").on(table.city),
    index("leads_prospected_at_idx").on(table.prospectedAt),
  ]
);
