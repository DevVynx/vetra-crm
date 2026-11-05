import { subscribeToEvents } from "./events";
import {
  getChatMessages,
  getChatsOverview,
  getContacts,
  getPhoneIdOfLid,
  getProfilePictureUrl,
} from "./messages";
import { findChatIdOfPhone, markChatAsRead, sendText } from "./send";
import {
  createSession,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
} from "./session";

export type { WahaEvent } from "./events";
export type { WahaChatOverview, WahaContact, WahaMessage } from "./messages";
export type { WahaQrCode, WahaSession } from "./session";
export * from "./WahaSendRestrictedError";
export * from "./WahaUnavailableError";

export const wahaClient = {
  createSession,
  findChatIdOfPhone,
  getChatMessages,
  getChatsOverview,
  getContacts,
  getPhoneIdOfLid,
  getProfilePictureUrl,
  getQrCode,
  getSession,
  logoutSession,
  markChatAsRead,
  sendText,
  startSession,
  stopSession,
  subscribeToEvents,
};
