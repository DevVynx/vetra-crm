import { wahaClient } from "@vetra/infra";

import { handleWahaEvent } from "../helpers/handleWahaEvent";
import { beginWhatsappSync } from "../helpers/syncLoop";

// Also keeps profile picture URLs fresh, since they expire and WAHA caches them for a day.
const DAILY_SYNC_INTERVAL_MS = 86_400_000;

export function startWhatsappSync(): void {
  wahaClient.subscribeToEvents({
    onOpen: beginWhatsappSync,
    onEvent: handleWahaEvent,
  });

  setInterval(beginWhatsappSync, DAILY_SYNC_INTERVAL_MS).unref();
}
