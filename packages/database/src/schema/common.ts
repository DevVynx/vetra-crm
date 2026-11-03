import { text, timestamp } from "drizzle-orm/pg-core";

export const createdAtColumn = () =>
  timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull();

export const updatedAtColumn = () =>
  timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const deletedAtColumn = () => timestamp("deleted_at", { mode: "date", withTimezone: true });

export const uuidPrimaryKeyColumn = () => text("id").primaryKey();
