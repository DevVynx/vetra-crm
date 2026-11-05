import {
  db,
  eq,
  inArray,
  sql,
  whatsappConversationsTable,
  whatsappMessagesTable,
} from "@vetra/database";

import { whatsappDomain, type WhatsappMessage } from "../domain";

// Both the import and the live events deliver the same messages, so a repeated one is skipped,
// and only what was really new moves the conversation forward.
export async function saveMessages(
  conversationId: string,
  messages: WhatsappMessage[],
  countsAsUnread: boolean
): Promise<number> {
  if (messages.length === 0) return 0;

  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(whatsappMessagesTable)
      .values(messages.map((message) => ({ ...message, conversationId })))
      .onConflictDoNothing({
        target: [whatsappMessagesTable.conversationId, whatsappMessagesTable.externalId],
      })
      .returning({
        direction: whatsappMessagesTable.direction,
        sentAt: whatsappMessagesTable.sentAt,
      });

    if (inserted.length === 0) return 0;

    const latest = Math.max(...inserted.map((message) => message.sentAt.getTime()));
    const { reset, add } = whatsappDomain.unreadChangeOf(inserted);
    const unreadBase = reset ? sql`0` : whatsappConversationsTable.unreadCount;

    await tx
      .update(whatsappConversationsTable)
      .set({
        lastMessageAt: sql`greatest(${whatsappConversationsTable.lastMessageAt}, ${new Date(latest).toISOString()}::timestamptz)`,
        ...(countsAsUnread ? { unreadCount: sql`${unreadBase} + ${add}` } : {}),
      })
      .where(eq(whatsappConversationsTable.id, conversationId));

    return inserted.length;
  });
}

export async function markConversationReadByMessage(externalId: string): Promise<boolean> {
  const updated = await db
    .update(whatsappConversationsTable)
    .set({ unreadCount: 0 })
    .where(
      inArray(
        whatsappConversationsTable.id,
        db
          .select({ conversationId: whatsappMessagesTable.conversationId })
          .from(whatsappMessagesTable)
          .where(eq(whatsappMessagesTable.externalId, externalId))
      )
    )
    .returning({ id: whatsappConversationsTable.id });

  return updated.length > 0;
}
