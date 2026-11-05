import { type WhatsappQrCodeResponse, whatsappQrCodeResponseSchema } from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function getWhatsappQrCodeController(
  _req: Request,
  res: Response<WhatsappQrCodeResponse>
) {
  res.json(whatsappQrCodeResponseSchema.parse(await whatsappServices.getWhatsappQrCode()));
}
