import { wahaClient } from "@vetra/infra";

import { type WhatsappConversation, whatsappDomain } from "../domain";
import { whatsappRepositories } from "../repositories";

export async function fetchConversationPhoto(conversation: WhatsappConversation): Promise<void> {
  const url = await wahaClient.getProfilePictureUrl(conversation.chatId);

  await whatsappRepositories.updateConversationPhoto(
    conversation.id,
    whatsappDomain.safePhotoUrl(url),
    new Date()
  );
}
