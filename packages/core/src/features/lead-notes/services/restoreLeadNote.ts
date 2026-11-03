import { getLead } from "../../leads/services/getLead";
import type { LeadNote } from "../domain";
import { LeadNoteAlreadyExistsError } from "../errors";
import { leadNoteRepositories } from "../repositories";

// Undo of a deletion: the note comes back with its original id and creation date.
export async function restoreLeadNote(note: LeadNote): Promise<void> {
  await getLead(note.leadId);
  if (await leadNoteRepositories.findLeadNoteById(note.id)) throw new LeadNoteAlreadyExistsError();

  await leadNoteRepositories.insertLeadNote(note);
}
