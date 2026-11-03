import { getLead } from "../../leads/services/getLead";
import type { LeadNote } from "../domain";
import { leadNoteRepositories } from "../repositories";

export async function listLeadNotes(leadId: string): Promise<LeadNote[]> {
  await getLead(leadId);
  return leadNoteRepositories.findLeadNotes(leadId);
}
