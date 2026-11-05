import { WhatsappConversationNotFoundError } from "../errors";
import { whatsappRepositories } from "../repositories";

export async function getWhatsappConversation(id: string) {
  const conversation = await whatsappRepositories.findConversationRowById(id);
  if (!conversation) throw new WhatsappConversationNotFoundError();

  return conversation;
}
