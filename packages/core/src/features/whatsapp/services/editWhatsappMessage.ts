import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMessageActionNotAllowedError,
  WhatsappMessageNotFoundError,
  WhatsappNotConnectedError,
} from "../errors";
import { callWahaAction } from "../helpers/callWaha";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

type EditWhatsappMessageInput = {
  conversationId: string;
  messageId: string;
  text: string;
};

// Only what the user wrote: WhatsApp doesn't let anyone edit the other person's messages.
export async function editWhatsappMessage({
  conversationId,
  messageId,
  text,
}: EditWhatsappMessageInput): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  const message = await whatsappRepositories.findMessageById(conversation.id, messageId);
  if (!message) throw new WhatsappMessageNotFoundError();
  if (message.direction !== "outbound" || message.deletedAt || message.content === null) {
    throw new WhatsappMessageActionNotAllowedError();
  }
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  const wahaId = whatsappDomain.wahaIdOf(message, conversation.chatId);
  await callWahaAction(() => wahaClient.editText(conversation.chatId, wahaId, text));

  await whatsappRepositories.updateMessageContent({ id: message.id }, text);
  notifyWhatsappChange();
}
