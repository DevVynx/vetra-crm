import { WhatsappMessageActionNotAllowedError, WhatsappMessageNotFoundError } from "../errors";
import { whatsappRepositories } from "../repositories";

export async function findMessageToReply(conversationId: string, messageId: string) {
  const message = await whatsappRepositories.findMessageById(conversationId, messageId);
  if (!message) throw new WhatsappMessageNotFoundError();
  if (message.deletedAt) throw new WhatsappMessageActionNotAllowedError();

  return message;
}
