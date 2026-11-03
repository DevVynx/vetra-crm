import { and, db, eq, projectsTable } from "@vetra/database";

// Linked installments and expenses stay in the ledger without a project (set null).
export async function deleteProject(leadId: string, projectId: string): Promise<boolean> {
  const deleted = await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.leadId, leadId)))
    .returning({ id: projectsTable.id });
  return deleted.length > 0;
}
