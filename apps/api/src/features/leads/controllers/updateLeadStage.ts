import { type UpdateLeadStageResponse, updateLeadStageResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function updateLeadStageController(
  req: ValidatedRequest<typeof v.updateLeadStage>,
  res: Response<UpdateLeadStageResponse>
) {
  const lead = await leadServices.changeLeadStage(req.params.id, req.body.stage);
  res.json(updateLeadStageResponseSchema.parse(toLeadSummary(lead)));
}
