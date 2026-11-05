import { EventEmitter } from "node:events";

const CHANGE_EVENT = "change";
const NOTIFY_WINDOW_MS = 1_000;

const emitter = new EventEmitter();
// One listener per open browser tab, so the default warning at 10 doesn't apply.
emitter.setMaxListeners(0);

let quietWindow: NodeJS.Timeout | null = null;
let changedDuringWindow = false;

// The first change goes out right away, so a new message shows at once. What follows inside the
// window becomes one signal: an import saves thousands of messages, not thousands of refetches.
export function notifyWhatsappChange(): void {
  if (quietWindow) {
    changedDuringWindow = true;
    return;
  }

  emitter.emit(CHANGE_EVENT);

  quietWindow = setTimeout(() => {
    quietWindow = null;

    if (changedDuringWindow) {
      changedDuringWindow = false;
      notifyWhatsappChange();
    }
  }, NOTIFY_WINDOW_MS);
  quietWindow.unref();
}

export function addWhatsappChangeListener(listener: () => void): void {
  emitter.on(CHANGE_EVENT, listener);
}

export function removeWhatsappChangeListener(listener: () => void): void {
  emitter.off(CHANGE_EVENT, listener);
}
