import type { SendNextActionResponse } from "@vetra/contracts";
import { nextActionServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function sendNextActionController(
  req: ValidatedRequest<typeof v.sendNextAction>,
  res: Response<SendNextActionResponse>
) {
  await nextActionServices.sendNextAction(req.params.id, req.body.confirmed);
  res.status(204).end();
}
