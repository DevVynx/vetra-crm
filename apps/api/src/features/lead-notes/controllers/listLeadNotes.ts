import { type ListLeadNotesResponse, listLeadNotesResponseSchema } from "@vetra/contracts";
import { leadNoteServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadNote } from "../helpers/leadNoteResponses";
import type v from "../validators";

export async function listLeadNotesController(
  req: ValidatedRequest<typeof v.listLeadNotes>,
  res: Response<ListLeadNotesResponse>
) {
  const notes = await leadNoteServices.listLeadNotes(req.params.id);
  res.json(listLeadNotesResponseSchema.parse({ notes: notes.map(toLeadNote) }));
}
