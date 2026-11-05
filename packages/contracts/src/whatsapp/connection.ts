import { z } from "zod";

export const whatsappConnectionStatusSchema = z.enum([
  "connected",
  "disconnected",
  "connecting",
  "awaiting_qr",
  "unavailable",
]);
export type WhatsappConnectionStatus = z.infer<typeof whatsappConnectionStatusSchema>;

export const whatsappStatusResponseSchema = z.object({
  status: whatsappConnectionStatusSchema,
  phone: z.string().nullable(),
  importing: z.boolean(),
  pendingAccountChange: z.object({ previousPhone: z.string() }).nullable(),
});
export type WhatsappStatusResponse = z.infer<typeof whatsappStatusResponseSchema>;

export const whatsappQrCodeResponseSchema = z.object({
  image: z.string().startsWith("data:image/png;base64,"),
});
export type WhatsappQrCodeResponse = z.infer<typeof whatsappQrCodeResponseSchema>;

export const whatsappConversationCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});
export type WhatsappConversationCountResponse = z.infer<
  typeof whatsappConversationCountResponseSchema
>;

export const resolveWhatsappAccountChangeRequestSchema = z.object({
  decision: z.enum(["replace", "cancel"]),
});
export type ResolveWhatsappAccountChangeRequest = z.infer<
  typeof resolveWhatsappAccountChangeRequestSchema
>;
