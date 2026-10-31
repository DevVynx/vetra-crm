import type { LeadConversation } from "@vetra/contracts";

import { formatLastContact } from "@/shared/utils/date";

export type ConversationState = {
  awaiting: "you" | "lead";
  waitingText: string;
  statusText: string;
};

export function conversationStateOf(conversation: LeadConversation): ConversationState | null {
  const last = conversation.messages.at(-1);
  if (!last) return null;

  const when = formatLastContact(new Date(last.sentAt));
  return last.direction === "inbound"
    ? {
        awaiting: "you",
        waitingText: `Aguardando você responder ${when}`,
        statusText: `Lead respondeu ${when}`,
      }
    : {
        awaiting: "lead",
        waitingText: `Aguardando resposta do lead ${when}`,
        statusText: `Você escreveu ${when}`,
      };
}
