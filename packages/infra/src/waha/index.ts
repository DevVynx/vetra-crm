import { subscribeToEvents } from "./events";
import { downloadMessageMedia } from "./media";
import {
  getChatMessages,
  getChatsOverview,
  getContacts,
  getPhoneIdOfLid,
  getProfilePictureUrl,
} from "./messages";
import { deleteMessage, editText, findChatIdOfPhone, markChatAsRead, sendText } from "./send";
import {
  createSession,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
} from "./session";

export type { WahaEvent } from "./events";
export type { WahaMediaFile } from "./media";
export type { WahaChatOverview, WahaContact, WahaMessage } from "./messages";
export type { WahaQrCode, WahaSession } from "./session";
export * from "./WahaMediaTooLargeError";
export * from "./WahaMediaUnavailableError";
export * from "./WahaRequestRejectedError";
export * from "./WahaSendRestrictedError";
export * from "./WahaUnavailableError";

export const wahaClient = {
  createSession,
  deleteMessage,
  downloadMessageMedia,
  editText,
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
