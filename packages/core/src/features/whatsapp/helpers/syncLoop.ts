import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { whatsappRepositories } from "../repositories";
import { repairStickerTypes } from "./repairStickerTypes";
import { syncConversations } from "./syncConversations";
import { notifyWhatsappChange } from "./whatsappChanges";

const RUN_INTERVAL_MS = 60_000;
const MIN_RUNS = 3;
const MAX_RUNS = 30;
const QUIET_RUNS_TO_SETTLE = 2;

// WAHA keeps receiving history for a while after pairing and sends no signal when it ends, so
// the sync repeats until nothing new shows up. Live events only apply once a run confirmed which
// account is connected; anything missed before that comes in with the run itself.
export const whatsappSyncState = {
  activePhone: null as string | null,
  importing: false,
};

let timer: NodeJS.Timeout | null = null;
let isRunning = false;
let shouldRestart = false;
let runs = 0;
let quietRuns = 0;

function setSyncState(activePhone: string | null, importing: boolean): void {
  const changed =
    whatsappSyncState.activePhone !== activePhone || whatsappSyncState.importing !== importing;

  whatsappSyncState.activePhone = activePhone;
  whatsappSyncState.importing = importing;
  if (changed) notifyWhatsappChange();
}

function clearTimer(): void {
  if (timer) clearTimeout(timer);
  timer = null;
}

// Prepares the account of this number, or returns null while a different one awaits a decision.
async function accountFor(phone: string, now: Date) {
  const account = await whatsappRepositories.findWhatsappAccount();

  if (!account) {
    const created = whatsappDomain.createAccount(phone, now);
    await whatsappRepositories.insertWhatsappAccount(created);
    return created;
  }

  if (account.phone === phone) return account;
  if ((await whatsappRepositories.countWhatsappConversations()) > 0) return null;

  const replaced = whatsappDomain.createAccount(phone, now);
  await whatsappRepositories.replaceWhatsappAccount(replaced);
  return replaced;
}

async function runOnce(): Promise<boolean> {
  const session = await wahaClient.getSession();
  const phone = session?.me ? whatsappDomain.phoneOfChatId(session.me.id) : null;

  if (session?.status !== "WORKING" || !phone) {
    setSyncState(null, false);
    return false;
  }

  const now = new Date();
  const account = await accountFor(phone, now);
  if (!account) {
    setSyncState(null, false);
    return false;
  }

  const isFullImport = !account.historyImportedAt;
  setSyncState(phone, isFullImport);

  const imported = await syncConversations(isFullImport, now);
  if (!account.stickersRepairedAt) {
    await repairStickerTypes();
    await whatsappRepositories.markStickersRepaired(new Date());
  }
  runs += 1;
  quietRuns = imported > 0 ? 0 : quietRuns + 1;

  const hasSettled = runs >= MAX_RUNS || (runs >= MIN_RUNS && quietRuns >= QUIET_RUNS_TO_SETTLE);
  if (!hasSettled) return true;

  if (isFullImport) await whatsappRepositories.markHistoryImported(new Date());
  setSyncState(phone, false);
  return false;
}

// Only the error's name: a database error carries the query's values, which include messages.
export function reportSyncFailure(error: unknown): void {
  console.error(`WhatsApp sync failed: ${error instanceof Error ? error.name : "unknown error"}`);
}

async function tick(): Promise<void> {
  timer = null;
  isRunning = true;
  let shouldContinue = true;

  try {
    shouldContinue = await runOnce();
  } catch (error) {
    reportSyncFailure(error);
  }

  isRunning = false;

  if (shouldRestart) {
    shouldRestart = false;
    void tick();
    return;
  }

  if (shouldContinue) {
    timer = setTimeout(() => void tick(), RUN_INTERVAL_MS);
    timer.unref();
  }
}

export function beginWhatsappSync(): void {
  clearTimer();
  runs = 0;
  quietRuns = 0;

  if (isRunning) {
    shouldRestart = true;
    return;
  }

  void tick();
}

export function stopWhatsappSync(): void {
  clearTimer();
  setSyncState(null, false);
}
