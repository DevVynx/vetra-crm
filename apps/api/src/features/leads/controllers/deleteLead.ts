import type { DeleteLeadResponse } from "@vetra/contracts";
import { leadServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteLeadController(
  req: ValidatedRequest<typeof v.deleteLead>,
  res: Response<DeleteLeadResponse>
) {
  await leadServices.deleteLead(req.params.id);
  res.status(204).end();
}
