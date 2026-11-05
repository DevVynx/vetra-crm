import {
  createSession,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
} from "./session";

export type { WahaQrCode, WahaSession } from "./session";
export * from "./WahaUnavailableError";

export const wahaClient = {
  createSession,
  getQrCode,
  getSession,
  logoutSession,
  startSession,
  stopSession,
};
