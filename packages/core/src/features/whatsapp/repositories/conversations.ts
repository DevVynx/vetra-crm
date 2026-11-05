import {
  and,
  count,
  db,
  desc,
  eq,
  isNotNull,
  or,
  qualified,
  sql,
  whatsappConversationsTable,
} from "@vetra/database";

import { containsSql } from "../../../shared/filters/filtersToSql";
import {
  type WhatsappConversation,
  whatsappDomain,
  type WhatsappMessageDirection,
  type WhatsappMessageStatus,
  type WhatsappMessageType,
} from "../domain";

const PREVIEW_LENGTH = 120;

export type WhatsappConversationRow = {
  id: string;
  phone: string | null;
  contactName: string | null;
  photoUrl: string | null;
  unreadCount: number;
  lastMessageAt: Date | null;
  lastMessage: {
    direction: WhatsappMessageDirection;
    type: WhatsappMessageType;
    status: WhatsappMessageStatus | null;
    content: string | null;
  } | null;
};

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

const conversationRowColumns = {
  id: whatsappConversationsTable.id,
  phone: whatsappConversationsTable.phone,
  contactName: whatsappConversationsTable.contactName,
  photoUrl: whatsappConversationsTable.photoUrl,
  unreadCount: whatsappConversationsTable.unreadCount,
  lastMessageAt: whatsappConversationsTable.lastMessageAt,
  // Read from the message itself, so the preview can never disagree with the thread.
  lastMessage: sql<WhatsappConversationRow["lastMessage"]>`(
    select json_build_object('direction', m.direction, 'type', m.type, 'status', m.status, 'content', left(m.content, ${PREVIEW_LENGTH}))
    from whatsapp_messages m
    where m.conversation_id = ${qualified(whatsappConversationsTable.id)}
    order by m.sent_at desc, m.id desc
    limit 1
  )`,
};

type FindConversationsPageInput = {
  q?: string | undefined;
  page: number;
  pageSize: number;
};

// Stored numbers may lack the ninth digit, so a number is also compared in the form people type it.
const PHONE_WITH_NINTH_DIGIT = sql`regexp_replace(${whatsappConversationsTable.phone}, '^55(\\d{2})([6-9]\\d{7})$', '55\\19\\2')`;

function matchesSearch(q: string) {
  const digits = whatsappDomain.phoneDigitsOfSearch(q);

  return or(
    containsSql(sql`${whatsappConversationsTable.contactName}`, q),
    ...(digits
      ? [
          containsSql(sql`${whatsappConversationsTable.phone}`, digits),
          containsSql(sql`${whatsappConversationsTable.phoneKey}`, digits),
          containsSql(PHONE_WITH_NINTH_DIGIT, digits),
        ]
      : [])
  );
}

// A conversation only joins the list once it has a message, so a just-opened empty one stays out.
export async function findConversationsPage({
  q,
  page,
  pageSize,
}: FindConversationsPageInput): Promise<{ items: WhatsappConversationRow[]; hasMore: boolean }> {
  const rows = await db
    .select(conversationRowColumns)
    .from(whatsappConversationsTable)
    .where(
      and(isNotNull(whatsappConversationsTable.lastMessageAt), q ? matchesSearch(q) : undefined)
    )
    .orderBy(desc(whatsappConversationsTable.lastMessageAt), desc(whatsappConversationsTable.id))
    .limit(pageSize + 1)
    .offset((page - 1) * pageSize);

  return { items: rows.slice(0, pageSize), hasMore: rows.length > pageSize };
}

export async function findConversationRowById(id: string): Promise<WhatsappConversationRow | null> {
  const [row] = await db
    .select(conversationRowColumns)
    .from(whatsappConversationsTable)
    .where(eq(whatsappConversationsTable.id, id))
    .limit(1);

  return row ?? null;
}

export async function findConversationById(id: string): Promise<WhatsappConversation | null> {
  const [conversation] = await db
    .select(conversationColumns)
    .from(whatsappConversationsTable)
    .where(eq(whatsappConversationsTable.id, id))
    .limit(1);

  return conversation ?? null;
}

export async function findConversationByPhoneKey(
  phoneKey: string
): Promise<WhatsappConversation | null> {
  const [conversation] = await db
    .select(conversationColumns)
    .from(whatsappConversationsTable)
    .where(eq(whatsappConversationsTable.phoneKey, phoneKey))
    .limit(1);

  return conversation ?? null;
}

export async function clearConversationUnread(id: string): Promise<void> {
  await db
    .update(whatsappConversationsTable)
    .set({ unreadCount: 0 })
    .where(eq(whatsappConversationsTable.id, id));
}

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
