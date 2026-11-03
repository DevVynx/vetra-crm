import { pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";

export const profileTable = pgTable("profile", {
  id: uuidPrimaryKeyColumn(),
  name: text().notNull(),
  timeZone: text().notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
