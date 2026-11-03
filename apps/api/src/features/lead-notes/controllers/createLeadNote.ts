import { type CreateLeadNoteResponse, createLeadNoteResponseSchema } from "@vetra/contracts";
import { leadNoteServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadNote } from "../helpers/leadNoteResponses";
import type v from "../validators";

export async function createLeadNoteController(
  req: ValidatedRequest<typeof v.createLeadNote>,
  res: Response<CreateLeadNoteResponse>
) {
  const note = await leadNoteServices.createLeadNote(req.params.id, req.body.content);
  res.status(201).json(createLeadNoteResponseSchema.parse(toLeadNote(note)));
}
