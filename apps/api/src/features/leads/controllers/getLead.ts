import { type GetLeadResponse, getLeadResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadDetail } from "../helpers/leadResponses";
import type v from "../validators";

export async function getLeadController(
  req: ValidatedRequest<typeof v.getLead>,
  res: Response<GetLeadResponse>
) {
  const lead = await leadServices.getLead(req.params.id);
  res.json(getLeadResponseSchema.parse(toLeadDetail(lead)));
}
