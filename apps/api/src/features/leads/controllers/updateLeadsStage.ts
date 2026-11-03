import { type UpdateLeadsStageResponse, updateLeadsStageResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadStageState } from "../helpers/leadResponses";
import type v from "../validators";

export async function updateLeadsStageController(
  req: ValidatedRequest<typeof v.updateLeadsStage>,
  res: Response<UpdateLeadsStageResponse>
) {
  const previous = await leadServices.changeLeadsStage(req.body.ids, req.body.stage);
  res.json(updateLeadsStageResponseSchema.parse({ previous: previous.map(toLeadStageState) }));
}
