import { ensureCustomerExists } from "../../customers/services/ensureCustomerExists";
import type { ProjectWithFinancial } from "../domain";
import { projectRepositories } from "../repositories";

export async function listProjects(leadId: string): Promise<ProjectWithFinancial[]> {
  await ensureCustomerExists(leadId);
  return projectRepositories.findProjects({ leadId });
}
