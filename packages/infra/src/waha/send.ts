import { z } from "zod";

import { parseWahaResponse, WAHA_SESSION, wahaCommand, wahaFetch } from "./wahaFetch";
import { WahaSendRestrictedError } from "./WahaSendRestrictedError";

const SEND_TIMEOUT_MS = 30_000;
// WhatsApp's limits on new contacts: reachout timelock and message capping.
const RESTRICTION_CODES = /\b(?:463|475)\b/;

const checkExistsSchema = z.object({
  numberExists: z.boolean(),
  chatId: z.string().nullish(),
});

export async function findChatIdOfPhone(phone: string): Promise<string | null> {
  const query = new URLSearchParams({ phone, session: WAHA_SESSION });
  const response = await wahaFetch(`/api/contacts/check-exists?${query}`);
  const { numberExists, chatId } = await parseWahaResponse(response, checkExistsSchema);

  return numberExists ? (chatId ?? null) : null;
}

const sentMessageSchema = z.object({ id: z.string().nullish() });

// The live event of this same message also arrives, so a missing id here loses nothing.
export async function sendText(chatId: string, text: string): Promise<string | null> {
  const response = await wahaFetch(
    "/api/sendText",
    "POST",
    { session: WAHA_SESSION, chatId, text },
    SEND_TIMEOUT_MS
  );

  if (!response.ok && RESTRICTION_CODES.test(await response.clone().text())) {
    throw new WahaSendRestrictedError();
  }

  return (await parseWahaResponse(response, sentMessageSchema)).id ?? null;
}

export const markChatAsRead = (chatId: string) =>
  wahaCommand(`/api/${WAHA_SESSION}/chats/${encodeURIComponent(chatId)}/messages/read`, {});
