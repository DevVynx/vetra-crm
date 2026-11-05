import { z } from "zod";

import {
  whatsappMessageDirectionSchema,
  whatsappMessageSchema,
  whatsappMessageStatusSchema,
  whatsappMessageTypeSchema,
} from "./message";

export const WHATSAPP_CONVERSATIONS_PAGE_SIZE = 30;
export const WHATSAPP_MESSAGES_PAGE_SIZE = 50;
export const WHATSAPP_MESSAGE_MAX_LENGTH = 4096;

export const whatsappConversationSchema = z.object({
  id: z.string(),
  phone: z.string().nullable(),
  contactName: z.string().nullable(),
  savedName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  unreadCount: z.number().int().nonnegative(),
  lastMessageAt: z.iso.datetime().nullable(),
  lead: z
    .object({
      id: z.string(),
      businessName: z.string(),
      contactName: z.string().nullable(),
      stage: z.string(),
      stoppedAtStage: z.string().nullable(),
      isCustomer: z.boolean(),
    })
    .nullable(),
  lastMessage: z
    .object({
      direction: whatsappMessageDirectionSchema,
      type: whatsappMessageTypeSchema,
      status: whatsappMessageStatusSchema.nullable(),
      content: z.string().nullable(),
      isDeleted: z.boolean(),
    })
    .nullable(),
});
export type WhatsappConversation = z.infer<typeof whatsappConversationSchema>;

export const leadConversationSchema = whatsappConversationSchema.extend({
  messages: z.array(whatsappMessageSchema),
});
export type LeadConversation = z.infer<typeof leadConversationSchema>;

export const getLeadConversationResponseSchema = z.object({
  conversation: leadConversationSchema.nullable(),
});
export type GetLeadConversationResponse = z.infer<typeof getLeadConversationResponseSchema>;

export const whatsappConversationParamsSchema = z.object({ id: z.string() });

export const listWhatsappConversationsQuerySchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(WHATSAPP_CONVERSATIONS_PAGE_SIZE),
});
export type ListWhatsappConversationsQuery = z.infer<typeof listWhatsappConversationsQuerySchema>;

export const listWhatsappConversationsResponseSchema = z.object({
  items: z.array(whatsappConversationSchema),
  hasMore: z.boolean(),
});
export type ListWhatsappConversationsResponse = z.infer<
  typeof listWhatsappConversationsResponseSchema
>;

export const openWhatsappConversationRequestSchema = z.object({
  phone: z.string().regex(/^\d{8,15}$/),
});
export type OpenWhatsappConversationRequest = z.infer<typeof openWhatsappConversationRequestSchema>;

export const whatsappConversationResponseSchema = z.object({
  conversation: whatsappConversationSchema,
});
export type WhatsappConversationResponse = z.infer<typeof whatsappConversationResponseSchema>;

export const listWhatsappMessagesQuerySchema = z.object({
  before: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(WHATSAPP_MESSAGES_PAGE_SIZE),
});
export type ListWhatsappMessagesQuery = z.infer<typeof listWhatsappMessagesQuerySchema>;

// Newest first: each page continues upward from the `before` message of the previous one.
export const listWhatsappMessagesResponseSchema = z.object({
  messages: z.array(whatsappMessageSchema),
  hasMore: z.boolean(),
});
export type ListWhatsappMessagesResponse = z.infer<typeof listWhatsappMessagesResponseSchema>;

const whatsappMessageTextSchema = z.string().trim().min(1).max(WHATSAPP_MESSAGE_MAX_LENGTH);

export const sendWhatsappMessageRequestSchema = z.object({
  text: whatsappMessageTextSchema,
  replyTo: z.string().optional(),
});
export type SendWhatsappMessageRequest = z.infer<typeof sendWhatsappMessageRequestSchema>;

export const whatsappMessageParamsSchema = z.object({ id: z.string(), messageId: z.string() });

export const editWhatsappMessageRequestSchema = z.object({ text: whatsappMessageTextSchema });
export type EditWhatsappMessageRequest = z.infer<typeof editWhatsappMessageRequestSchema>;

export const WHATSAPP_DELETE_MAX_MESSAGES = 50;

export const deleteWhatsappMessagesRequestSchema = z.object({
  ids: z.array(z.string()).min(1).max(WHATSAPP_DELETE_MAX_MESSAGES),
});
export type DeleteWhatsappMessagesRequest = z.infer<typeof deleteWhatsappMessagesRequestSchema>;
