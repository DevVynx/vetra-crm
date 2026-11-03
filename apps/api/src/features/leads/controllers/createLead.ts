import { type CreateLeadResponse, createLeadResponseSchema } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toLeadSummary } from "../helpers/leadResponses";
import type v from "../validators";

export async function createLeadController(
  req: ValidatedRequest<typeof v.createLead>,
  res: Response<CreateLeadResponse>
) {
  const lead = await leadServices.createLead(req.body);
  res.status(201).json(createLeadResponseSchema.parse(toLeadSummary(lead)));
}
