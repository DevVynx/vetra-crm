import type { ProjectWithFinancial } from "../domain";
import { ProjectNotFoundError } from "../errors";
import { projectRepositories } from "../repositories";

// Only finds the project among the given customer's own projects.
export async function getProject(leadId: string, projectId: string): Promise<ProjectWithFinancial> {
  const [project] = await projectRepositories.findProjects({ leadId, projectId });
  if (!project) throw new ProjectNotFoundError();

  return project;
}
