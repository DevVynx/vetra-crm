import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function connectWhatsappController(_req: Request, res: Response) {
  await whatsappServices.connectWhatsapp();
  res.status(204).send();
}
