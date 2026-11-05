import { wahaClient, WahaSendRestrictedError } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { callWaha } from "../helpers/callWaha";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

async function sendThroughWaha(chatId: string, text: string): Promise<string | null> {
  try {
    return await callWaha(() => wahaClient.sendText(chatId, text));
  } catch (error) {
    if (error instanceof WahaSendRestrictedError) throw new WhatsappSendRestrictedError();
    throw error;
  }
}

export async function sendWhatsappMessage(conversationId: string, text: string): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  const messageId = await sendThroughWaha(conversation.chatId, text);
  if (!messageId) return;

  await whatsappRepositories.saveMessages(
    conversation.id,
    [
      whatsappDomain.createMessage({
        externalId: whatsappDomain.externalIdOf(messageId),
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
