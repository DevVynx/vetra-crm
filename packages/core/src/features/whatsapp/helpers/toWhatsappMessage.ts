import type { WahaMessage } from "@vetra/infra";

import { whatsappDomain, type WhatsappMessage } from "../domain";

const SECOND_IN_MS = 1_000;

// WAHA tells a sticker by its own message kind; its file is a plain webp image like some photos.
const isSticker = (message: WahaMessage): boolean =>
  Boolean(message._data?.Message?.stickerMessage) ||
  Boolean(message._data?.Info?.MediaType?.includes("sticker"));

function typeOf(message: WahaMessage) {
  if (!message.hasMedia) return "text";

  return isSticker(message) ? "sticker" : whatsappDomain.messageTypeOf(message.media?.mimetype);
}

// A message with no text and no media is a system notice, not part of the conversation.
export function toWhatsappMessage(message: WahaMessage): WhatsappMessage | null {
  const content = message.body?.trim() ? message.body : null;
  if (!content && !message.hasMedia) return null;

  return whatsappDomain.createMessage({
    externalId: whatsappDomain.externalIdOf(message.id),
    direction: message.fromMe ? "outbound" : "inbound",
    type: typeOf(message),
    status: message.fromMe ? whatsappDomain.messageStatusOf(message.ackName) : null,
    content,
    mediaFilename: message.hasMedia ? (message.media?.filename ?? null) : null,
    wahaId: message.id,
    replyToExternalId: message.replyTo?.id ? whatsappDomain.externalIdOf(message.replyTo.id) : null,
    replyToContent: whatsappDomain.replySnippetOf(message.replyTo?.body ?? null),
    sentAt: new Date(message.timestamp * SECOND_IN_MS),
  });
}
