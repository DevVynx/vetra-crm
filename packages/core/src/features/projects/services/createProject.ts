import { ensureCustomerExists } from "../../customers/services/ensureCustomerExists";
import { projectDomain, type ProjectInput, type ProjectWithFinancial } from "../domain";
import { projectRepositories } from "../repositories";
import { getProject } from "./getProject";

export async function createProject(
  leadId: string,
  input: ProjectInput
): Promise<ProjectWithFinancial> {
  await ensureCustomerExists(leadId);

  const project = projectDomain.create(leadId, input, new Date());
  await projectRepositories.saveProject(project);

  return getProject(leadId, project.id);
}
