import type { WhatsappConversation } from "@vetra/contracts";

import { formatPhone } from "@/shared/utils/format";

export function conversationName(conversation: WhatsappConversation): string {
  if (conversation.savedName) return conversation.savedName;
  if (conversation.phone) return formatPhone(conversation.phone);

  // Only a hidden @lid contact has no number, and the profile name is all there is to tell them apart.
  return conversation.contactName ?? "Contato sem número";
}
