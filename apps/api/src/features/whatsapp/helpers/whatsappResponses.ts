import type { WhatsappConversation, WhatsappMessage } from "@vetra/contracts";
import type { whatsappServices } from "@vetra/core";

type ConversationRow = Awaited<ReturnType<typeof whatsappServices.getWhatsappConversation>>;
type MessageRow = Awaited<
  ReturnType<typeof whatsappServices.listWhatsappMessages>
>["messages"][number];

export const toWhatsappConversation = (row: ConversationRow): WhatsappConversation => ({
  ...row,
  lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
});

export const toWhatsappMessage = (row: MessageRow): WhatsappMessage => ({
  id: row.id,
  direction: row.direction,
  type: row.type,
  status: row.status,
  content: row.content,
  sentAt: row.sentAt.toISOString(),
});
