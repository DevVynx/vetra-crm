import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index";

// What drizzle-kit does, without the tool: a built server has only what it was built with.
export async function runMigrations(migrationsFolder: string): Promise<void> {
  await migrate(db, { migrationsFolder });
}
