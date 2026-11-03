import { db, eq, leadNotesTable } from "@vetra/database";

import type { LeadNote } from "../domain";
import { leadNoteColumns } from "./leadNoteColumns";

export async function updateLeadNoteContent(
  id: string,
  content: string
): Promise<LeadNote | undefined> {
  const [note] = await db
    .update(leadNotesTable)
    .set({ content })
    .where(eq(leadNotesTable.id, id))
    .returning(leadNoteColumns);
  return note;
}
