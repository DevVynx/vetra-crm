import { LeadNoteNotFoundError } from "../errors";
import { leadNoteRepositories } from "../repositories";

export async function deleteLeadNote(id: string): Promise<void> {
  const deleted = await leadNoteRepositories.deleteLeadNote(id);
  if (!deleted) throw new LeadNoteNotFoundError();
}
