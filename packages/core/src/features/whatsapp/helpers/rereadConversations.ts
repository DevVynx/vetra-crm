import { wahaClient } from "@vetra/infra";

import type { WhatsappMessage } from "../domain";
import { toWhatsappMessage } from "./toWhatsappMessage";

const MESSAGES_PAGE_SIZE = 200;
const SECOND_IN_MS = 1_000;
const DAY_IN_MS = 86_400_000;

export type ConversationToReread = {
  conversationId: string;
  chatId: string;
  since: Date;
};

// The import skips what it already has, so a correction to old messages has to read them again.
// Only the conversations that need it, and only from their oldest candidate on.
export async function rereadConversations(
  conversations: ConversationToReread[],
  handle: (conversationId: string, messages: WhatsappMessage[]) => Promise<void>
): Promise<void> {
  for (const { conversationId, chatId, since } of conversations) {
    const sinceSeconds = Math.floor((since.getTime() - DAY_IN_MS) / SECOND_IN_MS);

    for (let offset = 0; ; offset += MESSAGES_PAGE_SIZE) {
      const { messages, received } = await wahaClient.getChatMessages({
        chatId,
        sinceSeconds,
        limit: MESSAGES_PAGE_SIZE,
        offset,
      });

      await handle(
        conversationId,
        messages.flatMap((message) => toWhatsappMessage(message) ?? [])
      );
      if (received < MESSAGES_PAGE_SIZE) break;
    }
  }
}
