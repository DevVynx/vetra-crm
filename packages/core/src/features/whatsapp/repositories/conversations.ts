import {
  and,
  count,
  db,
  dealsTable,
  desc,
  eq,
  isNotNull,
  leadsTable,
  or,
  qualified,
  sql,
  whatsappConversationsTable,
  whatsappMessagesTable,
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
  savedName: string | null;
  photoUrl: string | null;
  unreadCount: number;
  lastMessageAt: Date | null;
  lead: {
    id: string;
    businessName: string;
    contactName: string | null;
    stage: string;
    stoppedAtStage: string | null;
    isCustomer: boolean;
  } | null;
  lastMessage: {
    direction: WhatsappMessageDirection;
    type: WhatsappMessageType;
    status: WhatsappMessageStatus | null;
    content: string | null;
    isDeleted: boolean;
  } | null;
};

const conversationColumns = {
  id: whatsappConversationsTable.id,
  chatId: whatsappConversationsTable.chatId,
  phone: whatsappConversationsTable.phone,
  phoneKey: whatsappConversationsTable.phoneKey,
  contactName: whatsappConversationsTable.contactName,
  savedName: whatsappConversationsTable.savedName,
  photoUrl: whatsappConversationsTable.photoUrl,
  photoFetchedAt: whatsappConversationsTable.photoFetchedAt,
  lastMessageAt: whatsappConversationsTable.lastMessageAt,
};

// A lead or customer is linked by comparing numbers, never by a stored reference.
const leadOfConversationSql = sql`${qualified(leadsTable.phoneKey)} = ${qualified(whatsappConversationsTable.phoneKey)}`;

const latestMessageOfConversationSql = sql`
  from ${whatsappMessagesTable}
  where ${qualified(whatsappMessagesTable.conversationId)} = ${qualified(whatsappConversationsTable.id)}
  order by ${qualified(whatsappMessagesTable.sentAt)} desc, ${qualified(whatsappMessagesTable.id)} desc
  limit 1`;

const conversationRowColumns = {
  id: whatsappConversationsTable.id,
  phone: whatsappConversationsTable.phone,
  contactName: whatsappConversationsTable.contactName,
  savedName: whatsappConversationsTable.savedName,
  photoUrl: whatsappConversationsTable.photoUrl,
  unreadCount: whatsappConversationsTable.unreadCount,
  lastMessageAt: whatsappConversationsTable.lastMessageAt,
  // Read through the number instead of stored, so it can't go stale when a lead is created, gets
  // another phone or is deleted. Conversations with no phone never match; see VET-12.md.
  lead: sql<WhatsappConversationRow["lead"]>`(
    select json_build_object(
      'id', ${qualified(leadsTable.id)},
      'businessName', ${qualified(leadsTable.businessName)},
      'contactName', ${qualified(leadsTable.contactName)},
      'stage', ${qualified(leadsTable.stageId)},
      'stoppedAtStage', ${qualified(leadsTable.stoppedAtStageId)},
      'isCustomer', exists(
        select 1 from ${dealsTable} where ${qualified(dealsTable.leadId)} = ${qualified(leadsTable.id)}
      )
    )
    from ${leadsTable}
    where ${leadOfConversationSql}
  )`,
  // Read from the message itself, so the preview can never disagree with the thread.
  lastMessage: sql<WhatsappConversationRow["lastMessage"]>`(
    select json_build_object(
      'direction', ${qualified(whatsappMessagesTable.direction)},
      'type', ${qualified(whatsappMessagesTable.type)},
      'status', ${qualified(whatsappMessagesTable.status)},
      'content', left(${qualified(whatsappMessagesTable.content)}, ${PREVIEW_LENGTH}),
      'isDeleted', ${qualified(whatsappMessagesTable.deletedAt)} is not null
    )
    ${latestMessageOfConversationSql}
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
    containsSql(sql`${whatsappConversationsTable.savedName}`, q),
    sql`exists (
      select 1 from ${leadsTable}
      where ${leadOfConversationSql}
        and (
          ${containsSql(sql`${qualified(leadsTable.businessName)}`, q)}
          or ${containsSql(sql`${qualified(leadsTable.contactName)}`, q)}
        )
    )`,
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

// Family and friends also write, but only leads and customers are work waiting on the user.
const awaitingSql = and(
  sql`exists (select 1 from ${leadsTable} where ${leadOfConversationSql})`,
  sql`(
    select ${qualified(whatsappMessagesTable.direction)} ${latestMessageOfConversationSql}
  ) = 'inbound'`
);

export async function findAwaitingConversations(
  limit: number
): Promise<{ items: WhatsappConversationRow[]; total: number }> {
  const [items, [totalRow]] = await Promise.all([
    db
      .select(conversationRowColumns)
      .from(whatsappConversationsTable)
      .where(awaitingSql)
      .orderBy(desc(whatsappConversationsTable.lastMessageAt), desc(whatsappConversationsTable.id))
      .limit(limit),
    db.select({ total: count() }).from(whatsappConversationsTable).where(awaitingSql),
  ]);

  return { items, total: totalRow?.total ?? 0 };
}

export async function findConversationRowByPhoneKey(
  phoneKey: string
): Promise<WhatsappConversationRow | null> {
  const [row] = await db
    .select(conversationRowColumns)
    .from(whatsappConversationsTable)
    .where(eq(whatsappConversationsTable.phoneKey, phoneKey))
    .orderBy(sql`${whatsappConversationsTable.lastMessageAt} desc nulls last`)
    .limit(1);

  return row ?? null;
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

// The same person can come under an id with or without the ninth digit, and stays one conversation.
export async function findConversationOfChat(chatId: string): Promise<WhatsappConversation | null> {
  const phoneKey = whatsappDomain.phoneKeyOfChatId(chatId);

  const [conversation] = await db
    .select(conversationColumns)
    .from(whatsappConversationsTable)
    .where(
      or(
        eq(whatsappConversationsTable.chatId, chatId),
        phoneKey ? eq(whatsappConversationsTable.phoneKey, phoneKey) : undefined
      )
    )
    .orderBy(sql`${whatsappConversationsTable.chatId} = ${chatId} desc`)
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
    // Any unique index: the chat id, or the same person arriving under the other form of the number.
    .onConflictDoNothing()
    .returning({ id: whatsappConversationsTable.id });

  return inserted.length > 0;
}

// When the agenda couldn't be read, the name already saved stays: nobody left the agenda.
export async function saveConversationFromOverview(
  conversation: WhatsappConversation,
  isAgendaKnown: boolean
): Promise<WhatsappConversation> {
  const [saved] = await db
    .insert(whatsappConversationsTable)
    .values(conversation)
    .onConflictDoUpdate({
      target: whatsappConversationsTable.chatId,
      set: {
        contactName: sql`coalesce(excluded.contact_name, ${whatsappConversationsTable.contactName})`,
        ...(isAgendaKnown ? { savedName: conversation.savedName } : {}),
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
