import { wahaClient } from "@vetra/infra";

import { whatsappRepositories } from "../repositories";
import { toWhatsappMessage } from "./toWhatsappMessage";

const MESSAGES_PAGE_SIZE = 200;
const SECOND_IN_MS = 1_000;
const DAY_IN_MS = 86_400_000;

// Stickers were stored as images before they had a type of their own, and the import skips what
// it already has. This reads again only the conversations that have an image with no caption, and
// corrects the ones WAHA says are stickers. It runs once per account.
export async function repairStickerTypes(): Promise<void> {
  const candidates = await whatsappRepositories.findConversationsWithCaptionlessImages();

  for (const { conversationId, chatId, since } of candidates) {
    const sinceSeconds = Math.floor((since.getTime() - DAY_IN_MS) / SECOND_IN_MS);

    for (let offset = 0; ; offset += MESSAGES_PAGE_SIZE) {
      const { messages, received } = await wahaClient.getChatMessages({
        chatId,
        sinceSeconds,
        limit: MESSAGES_PAGE_SIZE,
        offset,
      });
      const stickerIds = messages.flatMap((message) => {
        const converted = toWhatsappMessage(message);

        return converted?.type === "sticker" ? [converted.externalId] : [];
      });

      await whatsappRepositories.markMessagesAsStickers(conversationId, stickerIds);
      if (received < MESSAGES_PAGE_SIZE) break;
    }
  }
}
