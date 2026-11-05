import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function disconnectWhatsappController(_req: Request, res: Response) {
  await whatsappServices.disconnectWhatsapp();
  res.status(204).send();
}
