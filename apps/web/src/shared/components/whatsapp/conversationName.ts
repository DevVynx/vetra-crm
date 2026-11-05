import type { WhatsappConversation } from "@vetra/contracts";

import { formatPhone } from "@/shared/utils/format";

// Filling the contact of a lead means talking to that person; leaving it empty, to the company.
export function conversationName(conversation: WhatsappConversation): string {
  if (conversation.lead) return conversation.lead.contactName ?? conversation.lead.businessName;
  if (conversation.savedName) return conversation.savedName;
  if (conversation.phone) return formatPhone(conversation.phone);

  // Only a hidden @lid contact has no number, and the profile name is all there is to tell them apart.
  return conversation.contactName ?? "Contato sem número";
}

export function conversationSubtitle(conversation: WhatsappConversation): string | null {
  if (conversation.lead?.contactName) return conversation.lead.businessName;

  const phone = conversation.phone ? formatPhone(conversation.phone) : null;

  return phone === conversationName(conversation) ? null : phone;
}
