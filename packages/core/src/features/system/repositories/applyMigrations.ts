import { runMigrations } from "@vetra/database";

export async function applyMigrations(migrationsFolder: string): Promise<void> {
  await runMigrations(migrationsFolder);
}
