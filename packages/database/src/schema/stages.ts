import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { createdAtColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";

export const stageRoleEnum = pgEnum("stage_role", ["entry", "middle", "closing", "archive"]);

export const stagesTable = pgTable("stages", {
  id: uuidPrimaryKeyColumn(),
  name: text().notNull(),
  color: text().notNull(),
  role: stageRoleEnum().notNull(),
  // Counted separately for the funnel (entry, middle, closing) and for the archive stages.
  position: integer().notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
