import { whatsappRepositories } from "../repositories";
import { rereadConversations } from "./rereadConversations";

// Stickers were stored as images before they had a type of their own. An image with a caption
// can't be a sticker, so only the conversations with a captionless image are read again. It runs
// once per account.
export async function repairStickerTypes(): Promise<void> {
  const candidates = await whatsappRepositories.findConversationsWithCaptionlessImages();

  await rereadConversations(candidates, async (conversationId, messages) => {
    const stickerIds = messages
      .filter((message) => message.type === "sticker")
      .map((message) => message.externalId);

    await whatsappRepositories.markMessagesAsStickers(conversationId, stickerIds);
  });
}
