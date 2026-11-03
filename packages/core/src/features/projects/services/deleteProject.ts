import { ProjectNotFoundError } from "../errors";
import { projectRepositories } from "../repositories";

export async function deleteProject(leadId: string, projectId: string): Promise<void> {
  const deleted = await projectRepositories.deleteProject(leadId, projectId);
  if (!deleted) throw new ProjectNotFoundError();
}
