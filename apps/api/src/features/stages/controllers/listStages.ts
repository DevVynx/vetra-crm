import { type ListStagesResponse, listStagesResponseSchema } from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function listStagesController(
  _req: ValidatedRequest<typeof v.listStages>,
  res: Response<ListStagesResponse>
) {
  const stages = await stageServices.listStages();
  res.json(listStagesResponseSchema.parse({ stages }));
}
