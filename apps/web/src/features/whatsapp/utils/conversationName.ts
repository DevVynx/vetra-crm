import type { WhatsappConversation } from "@vetra/contracts";

import { formatPhone } from "@/shared/utils/format";

export function conversationName(conversation: WhatsappConversation): string {
  if (conversation.contactName) return conversation.contactName;

  return conversation.phone ? formatPhone(conversation.phone) : "Contato sem número";
}
