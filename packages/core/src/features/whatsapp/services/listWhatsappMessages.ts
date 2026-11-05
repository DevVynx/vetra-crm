import { whatsappRepositories } from "../repositories";
import { getWhatsappConversation } from "./getWhatsappConversation";

type ListWhatsappMessagesInput = {
  conversationId: string;
  before: string | undefined;
  limit: number;
};

export async function listWhatsappMessages(input: ListWhatsappMessagesInput) {
  await getWhatsappConversation(input.conversationId);

  return whatsappRepositories.findMessagesPage(input);
}
