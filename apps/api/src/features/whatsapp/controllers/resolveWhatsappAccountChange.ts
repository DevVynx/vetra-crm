import { whatsappServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

export async function resolveWhatsappAccountChangeController(
  req: ValidatedRequest<typeof v.resolveAccountChange>,
  res: Response
) {
  await whatsappServices.resolveWhatsappAccountChange(req.body.decision);
  res.status(204).send();
}
