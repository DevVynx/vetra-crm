import { count, db, eq, projectsTable } from "@vetra/database";

export async function countActiveProjects(): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "in_production"));
  return row?.count ?? 0;
}
