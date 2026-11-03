import type { RestoreLeadNoteResponse } from "@vetra/contracts";
import { leadNoteServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromLeadNote } from "../helpers/leadNoteResponses";
import type v from "../validators";

export async function restoreLeadNoteController(
  req: ValidatedRequest<typeof v.restoreLeadNote>,
  res: Response<RestoreLeadNoteResponse>
) {
  await leadNoteServices.restoreLeadNote(fromLeadNote(req.body));
  res.status(204).end();
}
