import { type WahaChatOverview, wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { whatsappRepositories } from "../repositories";
import { toWhatsappMessage } from "./toWhatsappMessage";
import { notifyWhatsappChange } from "./whatsappChanges";

const OVERVIEW_PAGE_SIZE = 100;
const MESSAGES_PAGE_SIZE = 200;
const CATCH_UP_OVERLAP_MS = 3_600_000;
const SECOND_IN_MS = 1_000;

type ImportChatInput = {
  conversationId: string;
  chatId: string;
  since: Date;
  countsAsUnread: boolean;
};

async function importChat({
  conversationId,
  chatId,
  since,
  countsAsUnread,
}: ImportChatInput): Promise<number> {
  const sinceSeconds = Math.floor(since.getTime() / SECOND_IN_MS);
  let imported = 0;

  for (let offset = 0; ; offset += MESSAGES_PAGE_SIZE) {
    const { messages, received } = await wahaClient.getChatMessages({
      chatId,
      sinceSeconds,
      limit: MESSAGES_PAGE_SIZE,
      offset,
    });
    const toSave = messages.flatMap((message) => toWhatsappMessage(message) ?? []);

    imported += await whatsappRepositories.saveMessages(conversationId, toSave, countsAsUnread);
    if (received < MESSAGES_PAGE_SIZE) return imported;
  }
}

// Someone can read a message while Vetra is off and never answer, so the chat brings nothing new
// and this is the only way the blue ticks would ever show.
async function refreshLastMessageStatus({ lastMessage }: WahaChatOverview): Promise<void> {
  const status = lastMessage?.fromMe ? whatsappDomain.messageStatusOf(lastMessage.ackName) : null;
  if (!status || !lastMessage?.id) return;

  const externalId = whatsappDomain.externalIdOf(lastMessage.id);
  if (await whatsappRepositories.advanceMessageStatus(externalId, status)) notifyWhatsappChange();
}

async function syncChat(chat: WahaChatOverview, isFullImport: boolean, now: Date): Promise<number> {
  if (!whatsappDomain.isIndividualChat(chat.id) || !chat.lastMessage) return 0;

  const lastMessageAt = new Date(chat.lastMessage.timestamp * SECOND_IN_MS);
  const stored = await whatsappRepositories.findConversationByChatId(chat.id);
  const historyStart = whatsappDomain.historyStart(now);
  if (!stored && lastMessageAt < historyStart) return 0;

  const conversation = await whatsappRepositories.saveConversationFromOverview(
    whatsappDomain.createConversation({
      chatId: chat.id,
      contactName: chat.name ?? null,
      photoUrl: whatsappDomain.safePhotoUrl(chat.picture),
      photoFetchedAt: now,
    })
  );

  if (isFullImport) {
    return importChat({
      conversationId: conversation.id,
      chatId: chat.id,
      since: historyStart,
      countsAsUnread: false,
    });
  }

  await refreshLastMessageStatus(chat);

  const storedUntil = stored?.lastMessageAt;
  if (storedUntil && lastMessageAt <= storedUntil) return 0;

  return importChat({
    conversationId: conversation.id,
    chatId: chat.id,
    since: storedUntil ? new Date(storedUntil.getTime() - CATCH_UP_OVERLAP_MS) : historyStart,
    countsAsUnread: true,
  });
}

// Reads every chat from the overview, so one run is both the first import and the catch-up.
export async function syncConversations(isFullImport: boolean, now: Date): Promise<number> {
  let imported = 0;

  for (let offset = 0; ; offset += OVERVIEW_PAGE_SIZE) {
    const chats = await wahaClient.getChatsOverview(OVERVIEW_PAGE_SIZE, offset);

    for (const chat of chats) {
      const importedFromChat = await syncChat(chat, isFullImport, now);
      imported += importedFromChat;
      if (importedFromChat > 0) notifyWhatsappChange();
    }

    if (chats.length < OVERVIEW_PAGE_SIZE) return imported;
  }
}
