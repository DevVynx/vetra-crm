import { getLead } from "../../leads/services/getLead";
import { type LeadNote, leadNoteDomain } from "../domain";
import { leadNoteRepositories } from "../repositories";

export async function createLeadNote(leadId: string, content: string): Promise<LeadNote> {
  await getLead(leadId);

  const note = leadNoteDomain.create(leadId, content, new Date());
  await leadNoteRepositories.insertLeadNote(note);

  return note;
}
