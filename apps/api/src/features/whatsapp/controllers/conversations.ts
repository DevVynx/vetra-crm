import {
  type GetLeadConversationResponse,
  getLeadConversationResponseSchema,
  type ListAwaitingConversationsResponse,
  listAwaitingConversationsResponseSchema,
  type ListWhatsappConversationsResponse,
  listWhatsappConversationsResponseSchema,
  type WhatsappConversationResponse,
  whatsappConversationResponseSchema,
} from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toWhatsappConversation, toWhatsappMessage } from "../helpers/whatsappResponses";
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

export async function listAwaitingWhatsappConversationsController(
  _req: Request,
  res: Response<ListAwaitingConversationsResponse>
) {
  const { items, total } = await whatsappServices.listAwaitingWhatsappConversations();

  res.json(
    listAwaitingConversationsResponseSchema.parse({
      conversations: items.map(toWhatsappConversation),
      total,
    })
  );
}

export async function getLeadConversationController(
  req: ValidatedRequest<typeof v.leadConversation>,
  res: Response<GetLeadConversationResponse>
) {
  const found = await whatsappServices.getLeadConversation(req.params.id);

  res.json(
    getLeadConversationResponseSchema.parse({
      conversation: found && {
        ...toWhatsappConversation(found.conversation),
        messages: found.messages.map(toWhatsappMessage),
      },
    })
  );
}

export async function openLeadConversationController(
  req: ValidatedRequest<typeof v.leadConversation>,
  res: Response<WhatsappConversationResponse>
) {
  const conversation = await whatsappServices.openLeadConversation(req.params.id);

  res.json(
    whatsappConversationResponseSchema.parse({ conversation: toWhatsappConversation(conversation) })
  );
}
