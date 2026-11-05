import { count, db, eq, sql, whatsappConversationsTable } from "@vetra/database";

import type { WhatsappConversation } from "../domain";

const conversationColumns = {
  id: whatsappConversationsTable.id,
  chatId: whatsappConversationsTable.chatId,
  phone: whatsappConversationsTable.phone,
  phoneKey: whatsappConversationsTable.phoneKey,
  contactName: whatsappConversationsTable.contactName,
  photoUrl: whatsappConversationsTable.photoUrl,
  photoFetchedAt: whatsappConversationsTable.photoFetchedAt,
  lastMessageAt: whatsappConversationsTable.lastMessageAt,
};

export async function countWhatsappConversations(): Promise<number> {
  const [row] = await db.select({ total: count() }).from(whatsappConversationsTable);

  return row?.total ?? 0;
}

export async function findConversationByChatId(
  chatId: string
): Promise<WhatsappConversation | null> {
  const [conversation] = await db
    .select(conversationColumns)
    .from(whatsappConversationsTable)
    .where(eq(whatsappConversationsTable.chatId, chatId))
    .limit(1);

  return conversation ?? null;
}

// Two events of a new contact can arrive together, so the insert has to tolerate the other one.
export async function insertConversationIfNew(
  conversation: WhatsappConversation
): Promise<boolean> {
  const inserted = await db
    .insert(whatsappConversationsTable)
    .values(conversation)
    .onConflictDoNothing({ target: whatsappConversationsTable.chatId })
    .returning({ id: whatsappConversationsTable.id });

  return inserted.length > 0;
}

export async function saveConversationFromOverview(
  conversation: WhatsappConversation
): Promise<WhatsappConversation> {
  const [saved] = await db
    .insert(whatsappConversationsTable)
    .values(conversation)
    .onConflictDoUpdate({
      target: whatsappConversationsTable.chatId,
      set: {
        contactName: sql`coalesce(excluded.contact_name, ${whatsappConversationsTable.contactName})`,
        photoUrl: conversation.photoUrl,
        photoFetchedAt: conversation.photoFetchedAt,
      },
    })
    .returning(conversationColumns);

  return saved ?? conversation;
}

export async function updateConversationPhoto(
  id: string,
  photoUrl: string | null,
  now: Date
): Promise<void> {
  await db
    .update(whatsappConversationsTable)
    .set({ photoUrl, photoFetchedAt: now })
    .where(eq(whatsappConversationsTable.id, id));
}
