import { db, whatsappAccountsTable, whatsappConversationsTable } from "@vetra/database";

import type { WhatsappAccount } from "../domain";

const accountColumns = {
  id: whatsappAccountsTable.id,
  phone: whatsappAccountsTable.phone,
  connectedAt: whatsappAccountsTable.connectedAt,
  historyImportedAt: whatsappAccountsTable.historyImportedAt,
  stickersRepairedAt: whatsappAccountsTable.stickersRepairedAt,
  audioDetailsFilledAt: whatsappAccountsTable.audioDetailsFilledAt,
};

export async function findWhatsappAccount(): Promise<WhatsappAccount | null> {
  const [account] = await db.select(accountColumns).from(whatsappAccountsTable).limit(1);

  return account ?? null;
}

export async function insertWhatsappAccount(account: WhatsappAccount): Promise<void> {
  await db.insert(whatsappAccountsTable).values(account);
}

export async function markHistoryImported(now: Date): Promise<void> {
  await db.update(whatsappAccountsTable).set({ historyImportedAt: now });
}

// Forgetting the account too makes the next connection a first import, for any number.
export async function deleteWhatsappHistory(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(whatsappConversationsTable);
    await tx.delete(whatsappAccountsTable);
  });
}

// Messages go with their conversations through ON DELETE CASCADE.
export async function replaceWhatsappAccount(account: WhatsappAccount): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(whatsappConversationsTable);
    await tx.delete(whatsappAccountsTable);
    await tx.insert(whatsappAccountsTable).values(account);
  });
}

export async function markStickersRepaired(now: Date): Promise<void> {
  await db.update(whatsappAccountsTable).set({ stickersRepairedAt: now });
}

export async function markAudioDetailsFilled(now: Date): Promise<void> {
  await db.update(whatsappAccountsTable).set({ audioDetailsFilledAt: now });
}
