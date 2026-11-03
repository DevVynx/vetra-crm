import type { RestoreLeadStagesResponse } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { fromLeadStageState } from "../helpers/leadResponses";
import type v from "../validators";

export async function restoreLeadStagesController(
  req: ValidatedRequest<typeof v.restoreLeadStages>,
  res: Response<RestoreLeadStagesResponse>
) {
  await leadServices.restoreLeadStages(req.body.leads.map(fromLeadStageState));
  res.status(204).end();
}
