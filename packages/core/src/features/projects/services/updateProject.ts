import { projectDomain, type ProjectInput, type ProjectWithFinancial } from "../domain";
import { projectRepositories } from "../repositories";
import { getProject } from "./getProject";

export async function updateProject(
  leadId: string,
  projectId: string,
  input: ProjectInput
): Promise<ProjectWithFinancial> {
  const { financial: _financial, ...project } = await getProject(leadId, projectId);

  await projectRepositories.saveProject(projectDomain.edit(project, input, new Date()));
  return getProject(leadId, projectId);
}
