import { z } from "zod";

import { parseWahaResponse, WAHA_SESSION, wahaCommand, wahaFetch } from "./wahaFetch";

// The status stays a plain string: an unknown value must not read as WAHA being down.
const wahaSessionSchema = z.object({
  status: z.string(),
  me: z.object({ id: z.string() }).nullish(),
});
export type WahaSession = z.infer<typeof wahaSessionSchema>;

const qrCodeSchema = z.object({
  mimetype: z.literal("image/png"),
  data: z.base64(),
});
export type WahaQrCode = z.infer<typeof qrCodeSchema>;

const sessionPath = `/api/sessions/${WAHA_SESSION}`;

export async function getSession(): Promise<WahaSession | null> {
  const response = await wahaFetch(sessionPath);
  if (response.status === 404) return null;

  return parseWahaResponse(response, wahaSessionSchema);
}

export const createSession = () =>
  wahaCommand("/api/sessions", { name: WAHA_SESSION, start: true });

export const startSession = () => wahaCommand(`${sessionPath}/start`);

export const logoutSession = () => wahaCommand(`${sessionPath}/logout`);

export const stopSession = () => wahaCommand(`${sessionPath}/stop`);

export async function getQrCode(): Promise<WahaQrCode> {
  const response = await wahaFetch(`/api/${WAHA_SESSION}/auth/qr`);

  return parseWahaResponse(response, qrCodeSchema);
}
