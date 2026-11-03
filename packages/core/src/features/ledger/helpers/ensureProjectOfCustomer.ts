import { getProject } from "../../projects/services/getProject";

// An entry can only be linked to a project of the same customer.
export async function ensureProjectOfCustomer(leadId: string, projectId: string | null) {
  if (projectId) await getProject(leadId, projectId);
}
