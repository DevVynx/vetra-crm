import { applyMigrations } from "../repositories/applyMigrations";

// Brings the database to the version of the code, before anything else reads it.
export async function migrateDatabase(migrationsFolder: string): Promise<void> {
  await applyMigrations(migrationsFolder);
}
