import { leadNotesTable } from "@vetra/database";

export const leadNoteColumns = {
  id: leadNotesTable.id,
  leadId: leadNotesTable.leadId,
  content: leadNotesTable.content,
  createdAt: leadNotesTable.createdAt,
};
