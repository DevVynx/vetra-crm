import { index, integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";
import { leadsTable } from "./leads";

export const whatsappMessageDirectionEnum = pgEnum("whatsapp_message_direction", [
  "inbound",
  "outbound",
]);

export const whatsappMessageTypeEnum = pgEnum("whatsapp_message_type", [
  "text",
  "audio",
  "image",
  "video",
  "document",
  "other",
]);

export const whatsappAccountsTable = pgTable("whatsapp_accounts", {
  id: uuidPrimaryKeyColumn(),
  phone: text().notNull(),
  connectedAt: instantColumn("connected_at").notNull(),
  historyImportedAt: instantColumn("history_imported_at"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const whatsappConversationsTable = pgTable(
  "whatsapp_conversations",
  {
    id: uuidPrimaryKeyColumn(),
    chatId: text().notNull(),
    phone: text(),
    phoneKey: text(),
    leadId: text().references(() => leadsTable.id, { onDelete: "set null" }),
    contactName: text(),
    photoUrl: text(),
    photoFetchedAt: instantColumn("photo_fetched_at"),
    unreadCount: integer().notNull().default(0),
    lastMessageAt: instantColumn("last_message_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("whatsapp_conversations_chat_id_idx").on(table.chatId),
    index("whatsapp_conversations_phone_key_idx").on(table.phoneKey),
    index("whatsapp_conversations_lead_id_idx").on(table.leadId),
    index("whatsapp_conversations_last_message_at_idx").on(table.lastMessageAt),
  ]
);

export const whatsappMessagesTable = pgTable(
  "whatsapp_messages",
  {
    id: uuidPrimaryKeyColumn(),
    conversationId: text()
      .notNull()
      .references(() => whatsappConversationsTable.id, { onDelete: "cascade" }),
    externalId: text().notNull(),
    direction: whatsappMessageDirectionEnum().notNull(),
    type: whatsappMessageTypeEnum().notNull(),
    content: text(),
    sentAt: instantColumn("sent_at").notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("whatsapp_messages_conversation_external_idx").on(
      table.conversationId,
      table.externalId
    ),
    index("whatsapp_messages_conversation_sent_at_idx").on(table.conversationId, table.sentAt),
    index("whatsapp_messages_external_id_idx").on(table.externalId),
  ]
);
