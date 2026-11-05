import { wahaClient } from "@vetra/infra";

import { WhatsappConversationNotFoundError } from "../errors";
import { reportSyncFailure, whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

// Clearing the count here comes first: not reaching WhatsApp must not get in the way of reading.
export async function markWhatsappConversationRead(conversationId: string): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  await whatsappRepositories.clearConversationUnread(conversation.id);
  notifyWhatsappChange();

  if (whatsappSyncState.activePhone) {
    wahaClient.markChatAsRead(conversation.chatId).catch(reportSyncFailure);
  }
}
