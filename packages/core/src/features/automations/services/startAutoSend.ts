import { runAutoSend } from "./runAutoSend";

const TICK_INTERVAL_MS = 15_000;

let isRunning = false;

// A pass that is still running is not started again, so a slow send never piles up behind itself.
async function tick(): Promise<void> {
  if (isRunning) return;

  isRunning = true;
  try {
    await runAutoSend();
  } catch (error) {
    console.error(
      `Automatic send pass failed: ${error instanceof Error ? error.name : "unknown error"}`
    );
  } finally {
    isRunning = false;
  }
}

// The state is in the database, so a restart loses nothing: what was due is found again.
export function startAutoSend(): void {
  setInterval(tick, TICK_INTERVAL_MS).unref();
}
