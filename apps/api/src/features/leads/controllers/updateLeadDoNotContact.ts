import { type UpdateLeadResponse, updateLeadResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function updateLeadDoNotContactController(
  req: ValidatedRequest<typeof v.updateLeadDoNotContact>,
  res: Response<UpdateLeadResponse>
) {
  const lead = await leadServices.updateLeadDoNotContact(req.params.id, req.body.doNotContact);
  res.json(updateLeadResponseSchema.parse(toLeadSummary(lead)));
}
