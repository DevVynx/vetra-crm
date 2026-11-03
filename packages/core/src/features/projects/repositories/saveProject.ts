import { db, projectsTable } from "@vetra/database";

import type { Project } from "../domain";

export async function saveProject(project: Project): Promise<void> {
  const { id, leadId, ...fields } = project;
  await db
    .insert(projectsTable)
    .values({ id, leadId, ...fields })
    .onConflictDoUpdate({ target: projectsTable.id, set: fields });
}
