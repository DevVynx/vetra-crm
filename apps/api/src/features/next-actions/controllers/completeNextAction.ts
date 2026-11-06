import type { CompleteNextActionResponse } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function completeNextActionController(
  req: ValidatedRequest<typeof v.completeNextAction>,
  res: Response<CompleteNextActionResponse>
) {
  await nextActionServices.completeNextAction(req.params.id);
  res.status(204).end();
}
