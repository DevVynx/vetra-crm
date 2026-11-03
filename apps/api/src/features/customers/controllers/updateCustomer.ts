import { type UpdateCustomerResponse, updateCustomerResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import { toLeadSummary } from "@/features/leads/helpers/leadResponses";
import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function updateCustomerController(
  req: ValidatedRequest<typeof v.updateCustomer>,
  res: Response<UpdateCustomerResponse>
) {
  const { document, ...contact } = req.body;
  const lead = await customerServices.updateCustomer(req.params.id, contact, document);
  res.json(updateCustomerResponseSchema.parse(toLeadSummary(lead)));
}
