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
  await whatsappServices.sendWhatsappMessage({
    conversationId: req.params.id,
    text: req.body.text,
    replyToMessageId: req.body.replyTo,
  });
  res.status(204).send();
}

export async function editWhatsappMessageController(
  req: ValidatedRequest<typeof v.editMessage>,
  res: Response
) {
  await whatsappServices.editWhatsappMessage({
    conversationId: req.params.id,
    messageId: req.params.messageId,
    text: req.body.text,
  });
  res.status(204).send();
}

export async function deleteWhatsappMessagesController(
  req: ValidatedRequest<typeof v.deleteMessages>,
  res: Response
) {
  await whatsappServices.deleteWhatsappMessages(req.params.id, req.body.ids);
  res.status(204).send();
}

export async function getWhatsappMessageMediaController(
  req: ValidatedRequest<typeof v.getMessageMedia>,
  res: Response
) {
  const { content, contentType, isInline, filename } =
    await whatsappServices.getWhatsappMessageMedia(req.params.id, req.params.messageId);

  const disposition = `${isInline ? "inline" : "attachment"}; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

  res
    .status(200)
    .set({
      "Content-Type": contentType,
      "Content-Length": String(content.length),
      "Content-Disposition": disposition,
      // A file sent by a stranger must never run in the page, whatever it claims to be.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "no-store",
    })
    .send(content);
}
