import { z } from "zod";

export const whatsappMessageDirectionSchema = z.enum(["inbound", "outbound"]);
export type WhatsappMessageDirection = z.infer<typeof whatsappMessageDirectionSchema>;

export const whatsappMessageTypeSchema = z.enum([
  "text",
  "audio",
  "image",
  "video",
  "document",
  "other",
]);
export type WhatsappMessageType = z.infer<typeof whatsappMessageTypeSchema>;

export const whatsappMessageStatusSchema = z.enum(["sent", "delivered", "read"]);
export type WhatsappMessageStatus = z.infer<typeof whatsappMessageStatusSchema>;

export const whatsappMessageSchema = z.object({
  id: z.string(),
  direction: whatsappMessageDirectionSchema,
  type: whatsappMessageTypeSchema,
  // Only for what was sent; it stays at delivered when the person turned read receipts off.
  status: whatsappMessageStatusSchema.nullable(),
  content: z.string().nullable(),
  sentAt: z.iso.datetime(),
});
export type WhatsappMessage = z.infer<typeof whatsappMessageSchema>;

export const leadConversationSchema = z.object({
  id: z.string(),
  unreadCount: z.number().int().nonnegative(),
  messages: z.array(whatsappMessageSchema),
});
export type LeadConversation = z.infer<typeof leadConversationSchema>;

export const getLeadConversationResponseSchema = z.object({
  conversation: leadConversationSchema.nullable(),
});
export type GetLeadConversationResponse = z.infer<typeof getLeadConversationResponseSchema>;
