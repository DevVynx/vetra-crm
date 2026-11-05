import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMessageActionNotAllowedError,
  WhatsappMessageNotFoundError,
  WhatsappNotConnectedError,
} from "../errors";
import { callWahaMedia } from "../helpers/callWaha";
import { whatsappSyncState } from "../helpers/syncLoop";
import { whatsappRepositories } from "../repositories";

type MediaOfMessage = {
  content: Buffer;
  contentType: string;
  isInline: boolean;
  filename: string;
};

// Nothing is kept: the file is asked for now, handed over, and forgotten.
export async function getWhatsappMessageMedia(
  conversationId: string,
  messageId: string
): Promise<MediaOfMessage> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  const message = await whatsappRepositories.findMessageById(conversation.id, messageId);
  if (!message) throw new WhatsappMessageNotFoundError();
  if (message.type === "text" || message.deletedAt)
    throw new WhatsappMessageActionNotAllowedError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  const wahaId = whatsappDomain.wahaIdOf(message, conversation.chatId);
  const file = await callWahaMedia(() =>
    wahaClient.downloadMessageMedia(conversation.chatId, wahaId)
  );

  return {
    content: file.content,
    ...whatsappDomain.mediaServingOf(file.mimetype),
    filename: whatsappDomain.safeFilenameOf(file.filename ?? message.mediaFilename),
  };
}
