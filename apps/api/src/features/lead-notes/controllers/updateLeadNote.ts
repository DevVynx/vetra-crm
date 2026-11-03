import { type UpdateLeadNoteResponse, updateLeadNoteResponseSchema } from "@vetra/contracts";
import { leadNoteServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadNote } from "../helpers/leadNoteResponses";
import type v from "../validators";

export async function updateLeadNoteController(
  req: ValidatedRequest<typeof v.updateLeadNote>,
  res: Response<UpdateLeadNoteResponse>
) {
  const note = await leadNoteServices.updateLeadNote(req.params.id, req.body.content);
  res.json(updateLeadNoteResponseSchema.parse(toLeadNote(note)));
}
