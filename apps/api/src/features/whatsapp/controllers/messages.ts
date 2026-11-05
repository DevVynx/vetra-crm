import {
  type ListWhatsappMessagesResponse,
  listWhatsappMessagesResponseSchema,
} from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import { toWhatsappMessage } from "../helpers/whatsappResponses";
import type v from "../validators";

export async function listWhatsappMessagesController(
  req: ValidatedRequest<typeof v.listMessages>,
  res: Response<ListWhatsappMessagesResponse>
) {
  const { messages, hasMore } = await whatsappServices.listWhatsappMessages({
    conversationId: req.params.id,
    before: req.query.before,
    limit: req.query.limit,
  });

  res.json(
    listWhatsappMessagesResponseSchema.parse({ messages: messages.map(toWhatsappMessage), hasMore })
  );
}

export async function sendWhatsappMessageController(
  req: ValidatedRequest<typeof v.sendMessage>,
  res: Response
) {
  await whatsappServices.sendWhatsappMessage(req.params.id, req.body.text);
  res.status(204).send();
}
