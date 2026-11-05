import type { WhatsappConnectionStatus } from "@vetra/contracts";

const STATUS_BY_WAHA_STATUS: Record<string, WhatsappConnectionStatus> = {
  STARTING: "connecting",
  SCAN_QR_CODE: "awaiting_qr",
  WORKING: "connected",
};

// WAHA uses FAILED for an expired QR Code and for a device removed on the phone, among others.
// To the user they all mean the same: not connected, and a new QR Code is the way back.
export const connectionStatusOf = (wahaStatus: string): WhatsappConnectionStatus =>
  STATUS_BY_WAHA_STATUS[wahaStatus] ?? "disconnected";

export const phoneOfWhatsappId = (id: string): string | null =>
  /^(\d+)(?::\d+)?@/.exec(id)?.[1] ?? null;
