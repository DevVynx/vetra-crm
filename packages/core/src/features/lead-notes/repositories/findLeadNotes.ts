import { db, desc, eq, leadNotesTable } from "@vetra/database";

import type { LeadNote } from "../domain";
import { leadNoteColumns } from "./leadNoteColumns";

export async function findLeadNotes(leadId: string): Promise<LeadNote[]> {
  return db
    .select(leadNoteColumns)
    .from(leadNotesTable)
    .where(eq(leadNotesTable.leadId, leadId))
    .orderBy(desc(leadNotesTable.createdAt));
}
