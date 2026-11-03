import {
  type CompleteNextActionResponse,
  completeNextActionResponseSchema,
} from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromNextActionInput, toNextAction } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function completeNextActionController(
  req: ValidatedRequest<typeof v.completeNextAction>,
  res: Response<CompleteNextActionResponse>
) {
  const scheduled = await nextActionServices.completeNextAction(
    req.params.id,
    fromNextActionInput(req.body.next)
  );
  res.json(completeNextActionResponseSchema.parse(toNextAction(scheduled)));
}
