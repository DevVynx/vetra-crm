import {
  WhatsappConversationNotFoundError,
  WhatsappMessageActionNotAllowedError,
  WhatsappMessageNotFoundError,
} from "../errors";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

// Only in Vetra: WhatsApp isn't told, so the person who sent it doesn't see the audio as listened.
// What was sent by the user is marked by WhatsApp's own receipts.
export async function markWhatsappMessagePlayed(
  conversationId: string,
  messageId: string
): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  const message = await whatsappRepositories.findMessageById(conversation.id, messageId);
  if (!message) throw new WhatsappMessageNotFoundError();
  if (message.direction !== "inbound" || message.type !== "audio" || message.deletedAt) {
    throw new WhatsappMessageActionNotAllowedError();
  }

  if (await whatsappRepositories.markMessagePlayed({ id: message.id })) notifyWhatsappChange();
}
