import type { DeleteStageResponse } from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteStageController(
  req: ValidatedRequest<typeof v.deleteStage>,
  res: Response<DeleteStageResponse>
) {
  await stageServices.deleteStage(req.params.id);
  res.status(204).end();
}
