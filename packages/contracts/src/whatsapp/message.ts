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
  replyTo: z
    .object({
      content: z.string().nullable(),
      direction: whatsappMessageDirectionSchema.nullable(),
    })
    .nullable(),
  editedAt: z.iso.datetime().nullable(),
  isDeleted: z.boolean(),
  sentAt: z.iso.datetime(),
});
export type WhatsappMessage = z.infer<typeof whatsappMessageSchema>;
