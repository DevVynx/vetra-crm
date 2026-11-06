import { db, leadNotesTable } from "@vetra/database";

export async function findAllNotes() {
  return db.select().from(leadNotesTable).orderBy(leadNotesTable.createdAt);
}
