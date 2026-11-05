import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function deleteWhatsappConversationsController(_req: Request, res: Response) {
  await whatsappServices.deleteWhatsappConversations();
  res.status(204).send();
}
