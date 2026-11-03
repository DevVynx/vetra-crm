import { leadNotesRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  createLeadNoteController,
  deleteLeadNoteController,
  listLeadNotesController,
  restoreLeadNoteController,
  updateLeadNoteController,
} from "./controllers";
import v from "./validators";

export const leadNotesRouter: Router = Router();

leadNotesRouter.get(leadNotesRoutes.byLead, v.listLeadNotes, listLeadNotesController);
leadNotesRouter.post(leadNotesRoutes.byLead, v.createLeadNote, createLeadNoteController);
// /notes/restore goes before /notes/:id, otherwise "restore" would be read as an id.
leadNotesRouter.post(leadNotesRoutes.restore, v.restoreLeadNote, restoreLeadNoteController);
leadNotesRouter.patch(leadNotesRoutes.byId, v.updateLeadNote, updateLeadNoteController);
leadNotesRouter.delete(leadNotesRoutes.byId, v.deleteLeadNote, deleteLeadNoteController);
