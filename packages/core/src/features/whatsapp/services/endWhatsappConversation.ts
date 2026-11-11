import { WhatsappConversationNotFoundError } from "../errors";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

export async function endWhatsappConversation(conversationId: string): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  await whatsappRepositories.setConversationResolvedAt(conversation.id, new Date());
  notifyWhatsappChange();
}
