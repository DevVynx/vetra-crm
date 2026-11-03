import { type GetCustomerResponse, getCustomerResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toCustomerDetail } from "../helpers/customerResponses";
import type v from "../validators";

export async function getCustomerController(
  req: ValidatedRequest<typeof v.getCustomer>,
  res: Response<GetCustomerResponse>
) {
  const customer = await customerServices.getCustomer(req.params.id);
  res.json(getCustomerResponseSchema.parse(toCustomerDetail(customer)));
}
