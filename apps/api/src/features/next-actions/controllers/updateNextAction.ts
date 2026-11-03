import { type UpdateNextActionResponse, updateNextActionResponseSchema } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromNextActionInput, toNextAction } from "../helpers/nextActionResponses";
import type v from "../validators";

export async function updateNextActionController(
  req: ValidatedRequest<typeof v.updateNextAction>,
  res: Response<UpdateNextActionResponse>
) {
  const action = await nextActionServices.updateNextAction(
    req.params.id,
    fromNextActionInput(req.body)
  );
  res.json(updateNextActionResponseSchema.parse(toNextAction(action)));
}
