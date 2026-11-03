import { type UpdateLeadResponse, updateLeadResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function updateLeadController(
  req: ValidatedRequest<typeof v.updateLead>,
  res: Response<UpdateLeadResponse>
) {
  const lead = await leadServices.updateLead(req.params.id, req.body);
  res.json(updateLeadResponseSchema.parse(toLeadSummary(lead)));
}
