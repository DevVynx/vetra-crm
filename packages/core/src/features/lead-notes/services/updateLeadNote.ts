import type { LeadNote } from "../domain";
import { LeadNoteNotFoundError } from "../errors";
import { leadNoteRepositories } from "../repositories";

export async function updateLeadNote(id: string, content: string): Promise<LeadNote> {
  const note = await leadNoteRepositories.updateLeadNoteContent(id, content);
  if (!note) throw new LeadNoteNotFoundError();

  return note;
}
