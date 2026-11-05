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
});
export type WhatsappStatusResponse = z.infer<typeof whatsappStatusResponseSchema>;

export const whatsappQrCodeResponseSchema = z.object({
  image: z.string().startsWith("data:image/png;base64,"),
});
export type WhatsappQrCodeResponse = z.infer<typeof whatsappQrCodeResponseSchema>;
