import {
  type ListStageLeadCountsResponse,
  listStageLeadCountsResponseSchema,
} from "@vetra/contracts";
import { stageServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function countLeadsPerStageController(
  _req: ValidatedRequest<typeof v.countLeadsPerStage>,
  res: Response<ListStageLeadCountsResponse>
) {
  const counts = await stageServices.countLeadsPerStage();
  res.json(listStageLeadCountsResponseSchema.parse({ counts }));
}
