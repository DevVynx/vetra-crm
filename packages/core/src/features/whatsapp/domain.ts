import type { WhatsappConnectionStatus } from "@vetra/contracts";
import { v7 as uuidv7 } from "uuid";

import { canonicalPhoneOf } from "../../shared/phone";

export type WhatsappMessageDirection = "inbound" | "outbound";
export type WhatsappMessageType =
  "text" | "audio" | "image" | "video" | "document" | "sticker" | "other";
export type WhatsappMessageStatus = "sent" | "delivered" | "read";

export type WhatsappAccount = {
  id: string;
  phone: string;
  connectedAt: Date;
  historyImportedAt: Date | null;
  stickersRepairedAt: Date | null;
};

export type WhatsappConversation = {
  id: string;
  chatId: string;
  phone: string | null;
  phoneKey: string | null;
  contactName: string | null;
  savedName: string | null;
  photoUrl: string | null;
  photoFetchedAt: Date | null;
  lastMessageAt: Date | null;
};

export type WhatsappMessage = {
  id: string;
  externalId: string;
  direction: WhatsappMessageDirection;
  type: WhatsappMessageType;
  status: WhatsappMessageStatus | null;
  content: string | null;
  mediaFilename: string | null;
  wahaId: string | null;
  replyToExternalId: string | null;
  replyToContent: string | null;
  editedAt: Date | null;
  deletedAt: Date | null;
  sentAt: Date;
};

type MessageExtras = Pick<
  WhatsappMessage,
  "wahaId" | "mediaFilename" | "replyToExternalId" | "replyToContent" | "editedAt" | "deletedAt"
>;

const HISTORY_DAYS = 365;
const DAY_IN_MS = 86_400_000;
const PHONE_CHAT_ID = /^(\d+)(?::\d+)?@(?:c\.us|s\.whatsapp\.net)$/;
const INDIVIDUAL_CHAT_ID = /@(?:c\.us|s\.whatsapp\.net|lid)$/;

const STATUS_BY_WAHA_STATUS: Record<string, WhatsappConnectionStatus> = {
  STARTING: "connecting",
  SCAN_QR_CODE: "awaiting_qr",
  WORKING: "connected",
};

// WAHA uses FAILED for an expired QR Code and for a device removed on the phone, among others.
// To the user they all mean the same: not connected, and a new QR Code is the way back.
const connectionStatusOf = (wahaStatus: string): WhatsappConnectionStatus =>
  STATUS_BY_WAHA_STATUS[wahaStatus] ?? "disconnected";

const phoneOfChatId = (chatId: string): string | null => PHONE_CHAT_ID.exec(chatId)?.[1] ?? null;

const isIndividualChat = (chatId: string): boolean => INDIVIDUAL_CHAT_ID.test(chatId);

const isLidChat = (chatId: string): boolean => chatId.endsWith("@lid");

const chatIdOfPhone = (phone: string): string => `${phone}@c.us`;

const phoneKeyOfChatId = (chatId: string): string | null => {
  const phone = phoneOfChatId(chatId);

  return phone && canonicalPhoneOf(phone);
};

// A search made only of phone characters also looks for a number, whatever its format.
const phoneDigitsOfSearch = (search: string): string | null =>
  /^[\d\s()+-]+$/.test(search) && /\d/.test(search) ? search.replace(/\D/g, "") : null;

function messageTypeOf(mimetype: string | null | undefined): WhatsappMessageType {
  if (!mimetype) return "other";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("application/") || mimetype.startsWith("text/")) return "document";
  return "other";
}

// The same message can come as `true_<chat>_<id>` or as the plain id, depending on the source.
const externalIdOf = (messageId: string): string => messageId.split("_").at(-1) ?? messageId;

const STATUS_BY_ACK: Record<string, WhatsappMessageStatus> = {
  SERVER: "sent",
  DEVICE: "delivered",
  READ: "read",
  PLAYED: "read",
};

const messageStatusOf = (ackName: string | null | undefined): WhatsappMessageStatus | null =>
  (ackName && STATUS_BY_ACK[ackName]) || null;

// A name only counts as being in the agenda when WhatsApp doesn't say the opposite: for someone
// not saved, some engines fill the same field with the name of the person's profile.
const savedNameOfContact = (contact: { name?: string | null; isMyContact?: boolean | null }) =>
  contact.isMyContact !== false && contact.name?.trim() ? contact.name.trim() : null;

const safePhotoUrl = (url: string | null | undefined): string | null =>
  url?.startsWith("https://") ? url : null;

const historyStart = (now: Date): Date => new Date(now.getTime() - HISTORY_DAYS * DAY_IN_MS);

const REPLY_SNIPPET_LENGTH = 200;

function createMessage(
  input: Omit<WhatsappMessage, "id" | keyof MessageExtras> & Partial<MessageExtras>
): WhatsappMessage {
  return {
    id: uuidv7(),
    wahaId: null,
    mediaFilename: null,
    replyToExternalId: null,
    replyToContent: null,
    editedAt: null,
    deletedAt: null,
    ...input,
  };
}

// Only these types may be shown by the browser. Anything else, html and svg included, is a
// download with a generic type, so a file sent by a stranger can never run in the page.
const INLINE_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
]);

function mediaServingOf(mimetype: string | null): { contentType: string; isInline: boolean } {
  const type = (mimetype ?? "").split(";")[0]?.trim().toLowerCase() ?? "";

  return INLINE_MEDIA_TYPES.has(type)
    ? { contentType: type, isInline: true }
    : { contentType: "application/octet-stream", isInline: false };
}

const MAX_FILENAME_LENGTH = 150;

// Goes into a header: no control characters, no path, no quotes.
const safeFilenameOf = (filename: string | null): string =>
  (filename ?? "")

    .replace(/[\u0000-\u001f\u007f"\\/]/g, "")
    .trim()
    .slice(0, MAX_FILENAME_LENGTH) || "arquivo";

const replySnippetOf = (content: string | null): string | null =>
  content ? content.slice(0, REPLY_SNIPPET_LENGTH) : null;

// Messages stored by an import may only know their short id, which WAHA's calls don't accept.
const wahaIdOf = (
  message: Pick<WhatsappMessage, "wahaId" | "externalId" | "direction">,
  chatId: string
): string =>
  message.wahaId?.includes("@")
    ? message.wahaId
    : `${message.direction === "outbound"}_${chatId}_${message.externalId}`;

type CreateConversationInput = {
  chatId: string;
  contactName: string | null;
  savedName: string | null;
  photoUrl: string | null;
  photoFetchedAt: Date | null;
};

function createConversation(input: CreateConversationInput): WhatsappConversation {
  const phone = phoneOfChatId(input.chatId);

  return {
    id: uuidv7(),
    phone,
    phoneKey: phone && canonicalPhoneOf(phone),
    lastMessageAt: null,
    ...input,
  };
}

function createAccount(phone: string, now: Date): WhatsappAccount {
  // A new account is imported with the right types, so it has nothing to repair.
  return {
    id: uuidv7(),
    phone,
    connectedAt: now,
    historyImportedAt: null,
    stickersRepairedAt: now,
  };
}

type UnreadChange = { reset: boolean; add: number };

// Answering from the phone means the conversation was read, so only what came after it counts.
function unreadChangeOf(messages: Pick<WhatsappMessage, "direction" | "sentAt">[]): UnreadChange {
  const directions = [...messages]
    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
    .map((message) => message.direction);
  const lastOutbound = directions.lastIndexOf("outbound");

  return { reset: lastOutbound !== -1, add: directions.length - lastOutbound - 1 };
}

export const whatsappDomain = {
  canonicalPhoneOf,
  phoneKeyOfChatId,
  chatIdOfPhone,
  connectionStatusOf,
  createAccount,
  createConversation,
  createMessage,
  externalIdOf,
  historyStart,
  isIndividualChat,
  isLidChat,
  messageStatusOf,
  mediaServingOf,
  messageTypeOf,
  phoneDigitsOfSearch,
  phoneOfChatId,
  replySnippetOf,
  safeFilenameOf,
  safePhotoUrl,
  savedNameOfContact,
  unreadChangeOf,
  wahaIdOf,
};
