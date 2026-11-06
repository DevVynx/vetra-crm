import { type UpdateLeadResponse, updateLeadResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function updateLeadAutoSendController(
  req: ValidatedRequest<typeof v.updateLeadAutoSend>,
  res: Response<UpdateLeadResponse>
) {
  const lead = await leadServices.updateLeadAutoSend(req.params.id, req.body.autoSend);
  res.json(updateLeadResponseSchema.parse(toLeadSummary(lead)));
}
