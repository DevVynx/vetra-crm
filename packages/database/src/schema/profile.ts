import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";

export const profileTable = pgTable("profile", {
  id: uuidPrimaryKeyColumn(),
  name: text().notNull(),
  timeZone: text().notNull(),
  // When the introduction was finished. Empty on a new install, which is what shows it.
  onboardedAt: instantColumn("onboarded_at"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
