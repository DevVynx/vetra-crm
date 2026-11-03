import { db, leadNotesTable } from "@vetra/database";

import type { LeadNote } from "../domain";

// Also used to restore a deleted note, so the given id and created_at are kept as they are.
export async function insertLeadNote(note: LeadNote): Promise<void> {
  await db.insert(leadNotesTable).values(note);
}
