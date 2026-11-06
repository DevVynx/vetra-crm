import { getLead } from "../../leads/services/getLead";
import { whatsappRepositories } from "../repositories";

// The conversation is found only through the lead (by its phone), never by an id of its own, so a
// chat that is not a lead's cannot be asked for here. Oldest first, the most recent `limit` of them.
export async function getLeadMessages(leadId: string, limit: number) {
  const { phoneKey } = await getLead(leadId);

  const conversation = await whatsappRepositories.findConversationRowByPhoneKey(phoneKey);
  if (!conversation) return null;

  const { messages, hasMore } = await whatsappRepositories.findMessagesPage({
    conversationId: conversation.id,
    before: undefined,
    limit,
  });

  return { messages: [...messages].reverse(), hasMore };
}
