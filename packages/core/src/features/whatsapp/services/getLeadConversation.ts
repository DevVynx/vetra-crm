import { getLead } from "../../leads/services/getLead";
import { whatsappRepositories } from "../repositories";

const MESSAGES_IN_LEAD_CARD = 4;

export async function getLeadConversation(leadId: string) {
  const { phoneKey } = await getLead(leadId);

  const conversation = await whatsappRepositories.findConversationRowByPhoneKey(phoneKey);
  if (!conversation) return null;

  const { messages } = await whatsappRepositories.findMessagesPage({
    conversationId: conversation.id,
    before: undefined,
    limit: MESSAGES_IN_LEAD_CARD,
  });

  return { conversation, messages: [...messages].reverse() };
}
