import { WahaSendRestrictedError, type WahaSentMessage } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMediaTooLargeError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { whatsappRepositories } from "../repositories";
import { callWaha } from "./callWaha";
import { whatsappSyncState } from "./syncLoop";
import { notifyWhatsappChange } from "./whatsappChanges";

const SECOND_IN_MS = 1_000;

// A conversation can only be written to while an account is connected.
export async function findConversationToSendTo(conversationId: string) {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  return conversation;
}

export function ensureMediaFits(content: Buffer): void {
  if (content.length > whatsappDomain.MEDIA_MAX_BYTES) throw new WhatsappMediaTooLargeError();
}

// A restriction WhatsApp puts on the number is a domain error, not a failure of WAHA.
export async function sendThroughWaha<Sent>(send: () => Promise<Sent>): Promise<Sent> {
  try {
    return await callWaha(send);
  } catch (error) {
    if (error instanceof WahaSendRestrictedError) throw new WhatsappSendRestrictedError();
    throw error;
  }
}

type SentMessageFields = Omit<
  Parameters<typeof whatsappDomain.createMessage>[0],
  "externalId" | "wahaId" | "direction" | "status" | "sentAt"
>;

// What was sent is stored with the time WhatsApp returns, so the order with what arrives next
// doesn't depend on this clock.
export async function saveSentMessage(
  conversationId: string,
  sent: WahaSentMessage,
  fields: SentMessageFields
): Promise<void> {
  await whatsappRepositories.saveMessages(
    conversationId,
    [
      whatsappDomain.createMessage({
        ...fields,
        externalId: whatsappDomain.externalIdOf(sent.id),
        wahaId: sent.id,
        direction: "outbound",
        status: "sent",
        sentAt: sent.sentAtSeconds ? new Date(sent.sentAtSeconds * SECOND_IN_MS) : new Date(),
      }),
    ],
    true
  );
  notifyWhatsappChange();
}
