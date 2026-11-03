import type { DeleteCustomerResponse } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteCustomerController(
  req: ValidatedRequest<typeof v.deleteCustomer>,
  res: Response<DeleteCustomerResponse>
) {
  await customerServices.deleteCustomer(req.params.id);
  res.status(204).end();
}
