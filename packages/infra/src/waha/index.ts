import { subscribeToEvents } from "./events";
import {
  getChatMessages,
  getChatsOverview,
  getPhoneIdOfLid,
  getProfilePictureUrl,
} from "./messages";
import {
  createSession,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
} from "./session";

export type { WahaEvent } from "./events";
export type { WahaChatOverview, WahaMessage } from "./messages";
export type { WahaQrCode, WahaSession } from "./session";
export * from "./WahaUnavailableError";

export const wahaClient = {
  createSession,
  getChatMessages,
  getChatsOverview,
  getPhoneIdOfLid,
  getProfilePictureUrl,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
  subscribeToEvents,
};
