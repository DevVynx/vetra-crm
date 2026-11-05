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

// Deletes for everyone, which WhatsApp only allows for the user's own messages.
export async function deleteWhatsappMessages(
  conversationId: string,
  messageIds: string[]
): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  const messages = await Promise.all(
    [...new Set(messageIds)].map((id) => whatsappRepositories.findMessageById(conversation.id, id))
  );
  if (messages.some((message) => !message)) throw new WhatsappMessageNotFoundError();
  if (messages.some((message) => message?.direction !== "outbound")) {
    throw new WhatsappMessageActionNotAllowedError();
  }
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  try {
    for (const message of messages) {
      if (!message || message.deletedAt) continue;

      const wahaId = whatsappDomain.wahaIdOf(message, conversation.chatId);
      await callWahaAction(() => wahaClient.deleteMessage(conversation.chatId, wahaId));
      await whatsappRepositories.markMessageDeleted({ id: message.id });
    }
  } finally {
    // Also when one of them fails: the ones before it are already gone on WhatsApp.
    notifyWhatsappChange();
  }
}
