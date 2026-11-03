import { type UpdateStageResponse, updateStageResponseSchema } from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function updateStageController(
  req: ValidatedRequest<typeof v.updateStage>,
  res: Response<UpdateStageResponse>
) {
  const stage = await stageServices.updateStage({ id: req.params.id, ...req.body });
  res.json(updateStageResponseSchema.parse(stage));
}
