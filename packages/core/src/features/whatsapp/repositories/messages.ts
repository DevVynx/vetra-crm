import {
  and,
  db,
  desc,
  eq,
  inArray,
  sql,
  type Transaction,
  whatsappConversationsTable,
  whatsappMessagesTable,
} from "@vetra/database";

import { whatsappDomain, type WhatsappMessage, type WhatsappMessageStatus } from "../domain";

// A message read while the service was off only shows its new status when it is delivered again.
async function advanceKnownStatuses(
  tx: Transaction,
  conversationId: string,
  messages: WhatsappMessage[]
): Promise<void> {
  const withStatus = messages.filter((message) => message.status);
  if (withStatus.length === 0) return;

  const values = sql.join(
    withStatus.map((message) => sql`(${message.externalId}, ${message.status})`),
    sql`, `
  );

  await tx.execute(sql`
    update whatsapp_messages m
    set status = v.status::whatsapp_message_status
    from (values ${values}) as v(external_id, status)
    where m.conversation_id = ${conversationId}
      and m.external_id = v.external_id
      and (m.status is null or m.status < v.status::whatsapp_message_status)
  `);
}

// Both the import and the live events deliver the same messages, so a repeated one is skipped,
// and only what was really new moves the conversation forward.
export async function saveMessages(
  conversationId: string,
  messages: WhatsappMessage[],
  countsAsUnread: boolean
): Promise<number> {
  if (messages.length === 0) return 0;

  return db.transaction(async (tx) => {
    await advanceKnownStatuses(tx, conversationId, messages);

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

// Postgres compares the enum in its declared order, so a late event never moves a status back.
export async function advanceMessageStatus(
  externalId: string,
  status: WhatsappMessageStatus
): Promise<boolean> {
  const updated = await db
    .update(whatsappMessagesTable)
    .set({ status })
    .where(
      and(
        eq(whatsappMessagesTable.externalId, externalId),
        eq(whatsappMessagesTable.direction, "outbound"),
        sql`(${whatsappMessagesTable.status} is null or ${whatsappMessagesTable.status} < ${status}::whatsapp_message_status)`
      )
    )
    .returning({ id: whatsappMessagesTable.id });

  return updated.length > 0;
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

const messageColumns = {
  id: whatsappMessagesTable.id,
  externalId: whatsappMessagesTable.externalId,
  direction: whatsappMessagesTable.direction,
  type: whatsappMessagesTable.type,
  status: whatsappMessagesTable.status,
  content: whatsappMessagesTable.content,
  sentAt: whatsappMessagesTable.sentAt,
};

type FindMessagesPageInput = {
  conversationId: string;
  before: string | undefined;
  limit: number;
};

// Pages by position instead of an offset: new messages arriving would shift an offset, and the
// longest conversations have tens of thousands of messages.
export async function findMessagesPage({
  conversationId,
  before,
  limit,
}: FindMessagesPageInput): Promise<{ messages: WhatsappMessage[]; hasMore: boolean }> {
  const rows = await db
    .select(messageColumns)
    .from(whatsappMessagesTable)
    .where(
      and(
        eq(whatsappMessagesTable.conversationId, conversationId),
        before
          ? sql`(${whatsappMessagesTable.sentAt}, ${whatsappMessagesTable.id}) < (
              select m.sent_at, m.id from whatsapp_messages m where m.id = ${before}
            )`
          : undefined
      )
    )
    .orderBy(desc(whatsappMessagesTable.sentAt), desc(whatsappMessagesTable.id))
    .limit(limit + 1);

  return { messages: rows.slice(0, limit), hasMore: rows.length > limit };
}
