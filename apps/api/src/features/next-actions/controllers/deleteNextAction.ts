import type { DeleteNextActionResponse } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function deleteNextActionController(
  req: ValidatedRequest<typeof v.deleteNextAction>,
  res: Response<DeleteNextActionResponse>
) {
  await nextActionServices.deleteNextAction(req.params.id);
  res.status(204).end();
}
