import type { RestoreNextActionResponse } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromNextActionInput } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function restoreNextActionController(
  req: ValidatedRequest<typeof v.restoreNextAction>,
  res: Response<RestoreNextActionResponse>
) {
  const { id, leadId, ...input } = req.body;
  await nextActionServices.restoreNextAction({ id, leadId, ...fromNextActionInput(input) });
  res.status(204).end();
}
