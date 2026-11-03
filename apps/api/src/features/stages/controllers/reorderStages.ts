import { type ReorderStagesResponse, reorderStagesResponseSchema } from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function reorderStagesController(
  req: ValidatedRequest<typeof v.reorderStages>,
  res: Response<ReorderStagesResponse>
) {
  const stages = await stageServices.reorderStages(req.body);
  res.json(reorderStagesResponseSchema.parse({ stages }));
}
