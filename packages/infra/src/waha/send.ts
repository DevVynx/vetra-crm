import { z } from "zod";

import {
  ensureWahaAccepted,
  parseWahaResponse,
  WAHA_SESSION,
  wahaCommand,
  wahaFetch,
} from "./wahaFetch";
import { WahaSendRestrictedError } from "./WahaSendRestrictedError";

const SEND_TIMEOUT_MS = 30_000;
const SEND_MEDIA_TIMEOUT_MS = 90_000;
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

const sentMessageSchema = z.object({ id: z.string().nullish(), timestamp: z.number().nullish() });

export type WahaSentMessage = { id: string; sentAtSeconds: number | null };

// The live event of this same message also arrives, so a missing id here loses nothing.
export async function sendText(
  chatId: string,
  text: string,
  replyTo?: string
): Promise<WahaSentMessage | null> {
  const response = await wahaFetch(
    "/api/sendText",
    "POST",
    { session: WAHA_SESSION, chatId, text, ...(replyTo ? { reply_to: replyTo } : {}) },
    SEND_TIMEOUT_MS
  );

  if (!response.ok && RESTRICTION_CODES.test(await response.clone().text())) {
    throw new WahaSendRestrictedError();
  }

  const { id, timestamp } = await parseWahaResponse(response, sentMessageSchema);

  return id ? { id, sentAtSeconds: timestamp ?? null } : null;
}

const messagePath = (chatId: string, messageId: string) =>
  `/api/${WAHA_SESSION}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`;

export async function editText(chatId: string, messageId: string, text: string): Promise<void> {
  ensureWahaAccepted(
    await wahaFetch(messagePath(chatId, messageId), "PUT", { text }, SEND_TIMEOUT_MS)
  );
}

export async function deleteMessage(chatId: string, messageId: string): Promise<void> {
  ensureWahaAccepted(
    await wahaFetch(messagePath(chatId, messageId), "DELETE", undefined, SEND_TIMEOUT_MS)
  );
}

export const markChatAsRead = (chatId: string) =>
  wahaCommand(`/api/${WAHA_SESSION}/chats/${encodeURIComponent(chatId)}/messages/read`, {});

export type WahaMediaKind = "image" | "video" | "file";

const SEND_MEDIA_PATHS: Record<WahaMediaKind, string> = {
  image: "/api/sendImage",
  video: "/api/sendVideo",
  file: "/api/sendFile",
};

type SendMediaInput = {
  chatId: string;
  kind: WahaMediaKind;
  file: { content: Buffer; mimetype: string; filename: string };
  caption: string | undefined;
};

// Only an image and a video take a caption.
export async function sendMedia({
  chatId,
  kind,
  file,
  caption,
}: SendMediaInput): Promise<WahaSentMessage | null> {
  const response = await wahaFetch(
    SEND_MEDIA_PATHS[kind],
    "POST",
    {
      session: WAHA_SESSION,
      chatId,
      file: {
        mimetype: file.mimetype,
        filename: file.filename,
        data: file.content.toString("base64"),
      },
      ...(caption && kind !== "file" ? { caption } : {}),
    },
    SEND_MEDIA_TIMEOUT_MS
  );

  if (!response.ok && RESTRICTION_CODES.test(await response.clone().text())) {
    throw new WahaSendRestrictedError();
  }

  const { id, timestamp } = await parseWahaResponse(response, sentMessageSchema);

  return id ? { id, sentAtSeconds: timestamp ?? null } : null;
}
