import { whatsappSyncState } from "../helpers/syncLoop";

// True while an account is connected and confirmed by the sync, which is when a message can be sent.
export function isWhatsappConnected(): boolean {
  return whatsappSyncState.activePhone !== null;
}
