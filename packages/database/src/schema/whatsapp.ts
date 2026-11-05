import { index, integer, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAtColumn, instantColumn, updatedAtColumn, uuidPrimaryKeyColumn } from "./common";

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

// Declared in order of progress: Postgres compares enum values by this order.
export const whatsappMessageStatusEnum = pgEnum("whatsapp_message_status", [
  "sent",
  "delivered",
  "read",
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
    // The name the person gave themselves on WhatsApp; savedName is the one in the user's agenda.
    contactName: text(),
    savedName: text(),
    photoUrl: text(),
    photoFetchedAt: instantColumn("photo_fetched_at"),
    unreadCount: integer().notNull().default(0),
    lastMessageAt: instantColumn("last_message_at"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("whatsapp_conversations_chat_id_idx").on(table.chatId),
    uniqueIndex("whatsapp_conversations_phone_key_idx").on(table.phoneKey),
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
    status: whatsappMessageStatusEnum(),
    content: text(),
    // WAHA's edit, delete and reply calls need its full id, and external_id keeps only the last part.
    wahaId: text(),
    replyToExternalId: text(),
    replyToContent: text(),
    editedAt: instantColumn("edited_at"),
    // The text is dropped when it is deleted, like WhatsApp does.
    deletedAt: instantColumn("deleted_at"),
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
