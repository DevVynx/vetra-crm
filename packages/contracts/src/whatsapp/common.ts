import { z } from "zod";

import { leadSummarySchema } from "../leads/common";

export const conversationSummarySchema = z.object({
  id: z.string(),
  contactName: z.string(),
  phone: z.string(),
  lead: leadSummarySchema.nullable(),
  lastMessagePreview: z.string(),
  lastMessageAt: z.iso.datetime(),
  unreadCount: z.number().int().nonnegative(),
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const listAwaitingConversationsResponseSchema = z.object({
  conversations: z.array(conversationSummarySchema),
});
export type ListAwaitingConversationsResponse = z.infer<
  typeof listAwaitingConversationsResponseSchema
>;
