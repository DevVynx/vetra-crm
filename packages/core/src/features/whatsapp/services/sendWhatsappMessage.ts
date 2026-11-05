import { wahaClient, WahaSendRestrictedError } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMessageActionNotAllowedError,
  WhatsappMessageNotFoundError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { callWaha } from "../helpers/callWaha";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

async function sendThroughWaha(
  chatId: string,
  text: string,
  replyToWahaId: string | undefined
): Promise<string | null> {
  try {
    return await callWaha(() => wahaClient.sendText(chatId, text, replyToWahaId));
  } catch (error) {
    if (error instanceof WahaSendRestrictedError) throw new WhatsappSendRestrictedError();
    throw error;
  }
}

async function findMessageToReply(conversationId: string, messageId: string) {
  const message = await whatsappRepositories.findMessageById(conversationId, messageId);
  if (!message) throw new WhatsappMessageNotFoundError();
  if (message.deletedAt) throw new WhatsappMessageActionNotAllowedError();

  return message;
}

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

  const messageId = await sendThroughWaha(conversation.chatId, text, replyToWahaId);
  if (!messageId) return;

  await whatsappRepositories.saveMessages(
    conversation.id,
    [
      whatsappDomain.createMessage({
        externalId: whatsappDomain.externalIdOf(messageId),
        wahaId: messageId,
        replyToExternalId: reply?.externalId ?? null,
        replyToContent: whatsappDomain.replySnippetOf(reply?.content ?? null),
        direction: "outbound",
        type: "text",
        status: "sent",
        content: text,
        sentAt: new Date(),
      }),
    ],
    true
  );
  notifyWhatsappChange();
}
