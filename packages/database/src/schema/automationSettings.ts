import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

import { updatedAtColumn } from "./common";

// One row, with a fixed id: the settings of the automations. Without the row, the defaults apply.
export const automationSettingsTable = pgTable("automation_settings", {
  id: text().primaryKey(),
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: boolean().notNull().default(false),
  autoSendDelayMinutes: integer().notNull().default(2),
  // Whether a lead that comes in (typed, imported or from the pipeline) starts with its own switch on.
  newLeadsAutoSend: boolean().notNull().default(false),
  updatedAt: updatedAtColumn(),
});
