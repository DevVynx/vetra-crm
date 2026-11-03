import { db, eq, leadNotesTable } from "@vetra/database";

import type { LeadNote } from "../domain";
import { leadNoteColumns } from "./leadNoteColumns";

export async function findLeadNoteById(id: string): Promise<LeadNote | undefined> {
  const [note] = await db
    .select(leadNoteColumns)
    .from(leadNotesTable)
    .where(eq(leadNotesTable.id, id));
  return note;
}
