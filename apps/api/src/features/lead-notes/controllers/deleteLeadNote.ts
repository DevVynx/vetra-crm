import type { DeleteLeadNoteResponse } from "@vetra/contracts";
import { leadNoteServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteLeadNoteController(
  req: ValidatedRequest<typeof v.deleteLeadNote>,
  res: Response<DeleteLeadNoteResponse>
) {
  await leadNoteServices.deleteLeadNote(req.params.id);
  res.status(204).end();
}
