import { deleteLeadNote } from "./deleteLeadNote";
import { findLeadNoteById } from "./findLeadNoteById";
import { findLeadNotes } from "./findLeadNotes";
import { insertLeadNote } from "./insertLeadNote";
import { updateLeadNoteContent } from "./updateLeadNoteContent";

export const leadNoteRepositories = {
  deleteLeadNote,
  findLeadNoteById,
  findLeadNotes,
  insertLeadNote,
  updateLeadNoteContent,
};
