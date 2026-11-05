import { EventEmitter } from "node:events";

const CHANGE_EVENT = "change";
const NOTIFY_WINDOW_MS = 1_000;

const emitter = new EventEmitter();
// One listener per open browser tab, so the default warning at 10 doesn't apply.
emitter.setMaxListeners(0);

let pendingNotification: NodeJS.Timeout | null = null;

// An import saves thousands of messages, which must not become thousands of refetches.
export function notifyWhatsappChange(): void {
  if (pendingNotification) return;

  pendingNotification = setTimeout(() => {
    pendingNotification = null;
    emitter.emit(CHANGE_EVENT);
  }, NOTIFY_WINDOW_MS);
  pendingNotification.unref();
}

export function addWhatsappChangeListener(listener: () => void): void {
  emitter.on(CHANGE_EVENT, listener);
}

export function removeWhatsappChangeListener(listener: () => void): void {
  emitter.off(CHANGE_EVENT, listener);
}
