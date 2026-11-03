import { type CreateStageResponse, createStageResponseSchema } from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function createStageController(
  req: ValidatedRequest<typeof v.createStage>,
  res: Response<CreateStageResponse>
) {
  const stage = await stageServices.createStage(req.body);
  res.status(201).json(createStageResponseSchema.parse(stage));
}
