import { type WhatsappStatusResponse, whatsappStatusResponseSchema } from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function getWhatsappStatusController(
  _req: Request,
  res: Response<WhatsappStatusResponse>
) {
  res.json(whatsappStatusResponseSchema.parse(await whatsappServices.getWhatsappStatus()));
}
