import {
  type WhatsappConversationCountResponse,
  whatsappConversationCountResponseSchema,
} from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

export async function countWhatsappConversationsController(
  _req: Request,
  res: Response<WhatsappConversationCountResponse>
) {
  const count = await whatsappServices.countWhatsappConversations();
  res.json(whatsappConversationCountResponseSchema.parse({ count }));
}
