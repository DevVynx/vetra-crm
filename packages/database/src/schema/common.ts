import { text, timestamp } from "drizzle-orm/pg-core";

export const instantColumn = (name: string) =>
  timestamp(name, { mode: "date", withTimezone: true });

export const createdAtColumn = () => instantColumn("created_at").defaultNow().notNull();

export const updatedAtColumn = () =>
  instantColumn("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const deletedAtColumn = () => instantColumn("deleted_at");

export const uuidPrimaryKeyColumn = () => text("id").primaryKey();
