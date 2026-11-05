import type { WhatsappConnectionStatus } from "@vetra/contracts";
import { v7 as uuidv7 } from "uuid";

export type WhatsappMessageDirection = "inbound" | "outbound";
export type WhatsappMessageType = "text" | "audio" | "image" | "video" | "document" | "other";
export type WhatsappMessageStatus = "sent" | "delivered" | "read";

export type WhatsappAccount = {
  id: string;
  phone: string;
  connectedAt: Date;
  historyImportedAt: Date | null;
};

export type WhatsappConversation = {
  id: string;
  chatId: string;
  phone: string | null;
  phoneKey: string | null;
  contactName: string | null;
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
  sentAt: Date;
};

const HISTORY_DAYS = 365;
const DAY_IN_MS = 86_400_000;
const PHONE_CHAT_ID = /^(\d+)(?::\d+)?@(?:c\.us|s\.whatsapp\.net)$/;
const INDIVIDUAL_CHAT_ID = /@(?:c\.us|s\.whatsapp\.net|lid)$/;
const BRAZILIAN_MOBILE_WITH_NINTH_DIGIT = /^55(\d{2})9(\d{8})$/;

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

// Always a full international number. In Brazil, WhatsApp ids carry the ninth digit only in some
// regions, while people always type it, so both forms must match. Other countries stay untouched.
const canonicalPhoneOf = (phone: string): string =>
  phone.replace(/\D/g, "").replace(BRAZILIAN_MOBILE_WITH_NINTH_DIGIT, "55$1$2");

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

const safePhotoUrl = (url: string | null | undefined): string | null =>
  url?.startsWith("https://") ? url : null;

const historyStart = (now: Date): Date => new Date(now.getTime() - HISTORY_DAYS * DAY_IN_MS);

function createMessage(input: Omit<WhatsappMessage, "id">): WhatsappMessage {
  return { id: uuidv7(), ...input };
}

type CreateConversationInput = {
  chatId: string;
  contactName: string | null;
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
  return { id: uuidv7(), phone, connectedAt: now, historyImportedAt: null };
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
  messageTypeOf,
  phoneDigitsOfSearch,
  phoneOfChatId,
  safePhotoUrl,
  unreadChangeOf,
};
