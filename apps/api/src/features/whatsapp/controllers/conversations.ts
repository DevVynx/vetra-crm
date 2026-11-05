import {
  type ListWhatsappConversationsResponse,
  listWhatsappConversationsResponseSchema,
  type WhatsappConversationResponse,
  whatsappConversationResponseSchema,
} from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toWhatsappConversation } from "../helpers/whatsappResponses";
import type v from "../validators";

export async function listWhatsappConversationsController(
  req: ValidatedRequest<typeof v.listConversations>,
  res: Response<ListWhatsappConversationsResponse>
) {
  const { items, hasMore } = await whatsappServices.listWhatsappConversations(req.query);

  res.json(
    listWhatsappConversationsResponseSchema.parse({
      items: items.map(toWhatsappConversation),
      hasMore,
    })
  );
}

export async function getWhatsappConversationController(
  req: ValidatedRequest<typeof v.getConversation>,
  res: Response<WhatsappConversationResponse>
) {
  const conversation = await whatsappServices.getWhatsappConversation(req.params.id);

  res.json(
    whatsappConversationResponseSchema.parse({ conversation: toWhatsappConversation(conversation) })
  );
}

export async function openWhatsappConversationController(
  req: ValidatedRequest<typeof v.openConversation>,
  res: Response<WhatsappConversationResponse>
) {
  const conversation = await whatsappServices.openWhatsappConversation(req.body.phone);

  res.json(
    whatsappConversationResponseSchema.parse({ conversation: toWhatsappConversation(conversation) })
  );
}

export async function markWhatsappConversationReadController(
  req: ValidatedRequest<typeof v.markRead>,
  res: Response
) {
  await whatsappServices.markWhatsappConversationRead(req.params.id);
  res.status(204).send();
}
