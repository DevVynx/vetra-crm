import { customerServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function updateMonthlyFeeController(
  req: ValidatedRequest<typeof v.updateMonthlyFee>,
  res: Response
) {
  await customerServices.updateMonthlyFee(req.params.id, req.body.monthlyFeeInCents);
  res.status(204).send();
}
