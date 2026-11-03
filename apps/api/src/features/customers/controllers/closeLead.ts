import { type CloseLeadResponse, closeLeadResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import { toLeadSummary } from "@/features/leads/helpers/leadResponses";
import type { ValidatedRequest } from "@/shared/http/validation";

import { fromDealPayment } from "../helpers/customerResponses";
import type v from "../validators";

export async function closeLeadController(
  req: ValidatedRequest<typeof v.closeLead>,
  res: Response<CloseLeadResponse>
) {
  const lead = await customerServices.closeLead(req.params.id, fromDealPayment(req.body));
  res.json(closeLeadResponseSchema.parse(toLeadSummary(lead)));
}
