import { db, projectsTable } from "@vetra/database";

export async function findAllProjects() {
  return db.select().from(projectsTable).orderBy(projectsTable.createdAt);
}
