import { wahaClient, WahaSendRestrictedError, type WahaSentMessage } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { callWaha } from "../helpers/callWaha";
import { findMessageToReply } from "../helpers/findMessageToReply";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

async function sendThroughWaha(
  chatId: string,
  text: string,
  replyToWahaId: string | undefined
): Promise<WahaSentMessage | null> {
  try {
    return await callWaha(() => wahaClient.sendText(chatId, text, replyToWahaId));
  } catch (error) {
    if (error instanceof WahaSendRestrictedError) throw new WhatsappSendRestrictedError();
    throw error;
  }
}

const SECOND_IN_MS = 1_000;

type SendWhatsappMessageInput = {
  conversationId: string;
  text: string;
  replyToMessageId: string | undefined;
};

export async function sendWhatsappMessage({
  conversationId,
  text,
  replyToMessageId,
}: SendWhatsappMessageInput): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  const reply = replyToMessageId
    ? await findMessageToReply(conversation.id, replyToMessageId)
    : null;
  const replyToWahaId = reply ? whatsappDomain.wahaIdOf(reply, conversation.chatId) : undefined;

  const sent = await sendThroughWaha(conversation.chatId, text, replyToWahaId);
  if (!sent) return;

  await whatsappRepositories.saveMessages(
    conversation.id,
    [
      whatsappDomain.createMessage({
        externalId: whatsappDomain.externalIdOf(sent.id),
        wahaId: sent.id,
        replyToExternalId: reply?.externalId ?? null,
        replyToContent: whatsappDomain.replySnippetOf(reply?.content ?? null),
        direction: "outbound",
        type: "text",
        status: "sent",
        content: text,
        // WhatsApp's own time, so the order with what arrives next doesn't depend on this clock.
        sentAt: sent.sentAtSeconds ? new Date(sent.sentAtSeconds * SECOND_IN_MS) : new Date(),
      }),
    ],
    true
  );
  notifyWhatsappChange();
}
