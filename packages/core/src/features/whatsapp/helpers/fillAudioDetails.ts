import { whatsappRepositories } from "../repositories";
import { rereadConversations } from "./rereadConversations";

// Audio was stored before its length and its voice mark were kept. Runs once per account.
export async function fillAudioDetails(): Promise<void> {
  const candidates = await whatsappRepositories.findConversationsWithAudioMissingDetails();

  await rereadConversations(candidates, async (conversationId, messages) => {
    for (const message of messages) {
      if (message.type === "audio") {
        await whatsappRepositories.updateAudioDetails(conversationId, message);
      }
    }
  });
}
