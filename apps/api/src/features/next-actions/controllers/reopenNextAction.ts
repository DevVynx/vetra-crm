import { type ReopenNextActionResponse, reopenNextActionResponseSchema } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toNextAction } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function reopenNextActionController(
  req: ValidatedRequest<typeof v.reopenNextAction>,
  res: Response<ReopenNextActionResponse>
) {
  const action = await nextActionServices.reopenNextAction(req.params.id);
  res.json(reopenNextActionResponseSchema.parse(toNextAction(action)));
}
