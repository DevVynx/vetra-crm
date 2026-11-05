import type { WahaMessage } from "@vetra/infra";

import { whatsappDomain, type WhatsappMessage } from "../domain";

const SECOND_IN_MS = 1_000;

// A message with no text and no media is a system notice, not part of the conversation.
export function toWhatsappMessage(message: WahaMessage): WhatsappMessage | null {
  const content = message.body?.trim() ? message.body : null;
  if (!content && !message.hasMedia) return null;

  return whatsappDomain.createMessage({
    externalId: whatsappDomain.externalIdOf(message.id),
    direction: message.fromMe ? "outbound" : "inbound",
    type: message.hasMedia ? whatsappDomain.messageTypeOf(message.media?.mimetype) : "text",
    status: message.fromMe ? whatsappDomain.messageStatusOf(message.ackName) : null,
    content,
    sentAt: new Date(message.timestamp * SECOND_IN_MS),
  });
}
