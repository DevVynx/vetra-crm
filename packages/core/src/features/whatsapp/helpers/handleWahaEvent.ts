import { wahaClient, type WahaEvent, type WahaMessage } from "@vetra/infra";

import { type WhatsappConversation, whatsappDomain } from "../domain";
import { whatsappRepositories } from "../repositories";
import { fetchConversationPhoto } from "./fetchConversationPhoto";
import {
  beginWhatsappSync,
  reportSyncFailure,
  stopWhatsappSync,
  whatsappSyncState,
} from "./syncLoop";
import { toWhatsappMessage } from "./toWhatsappMessage";
import { notifyWhatsappChange } from "./whatsappChanges";

// Live events name the person by a hidden @lid id, with the phone in a separate field, while the
// chat list uses the phone. Both must resolve to one conversation; see VET-12.md.
async function resolveChatId(message: WahaMessage): Promise<string | null> {
  const info = message._data?.Info;
  const chat = info?.Chat ?? (message.fromMe ? message.to : message.from);
  if (!chat || !whatsappDomain.isIndividualChat(chat)) return null;

  const phone = whatsappDomain.phoneOfChatId(chat);
  if (phone) return whatsappDomain.chatIdOfPhone(phone);

  const alternative = message.fromMe ? info?.RecipientAlt : info?.SenderAlt;
  const phoneId = alternative ?? (await wahaClient.getPhoneIdOfLid(chat));
  const resolved = phoneId ? whatsappDomain.phoneOfChatId(phoneId) : null;

  return resolved ? whatsappDomain.chatIdOfPhone(resolved) : chat;
}

async function conversationFor(
  chatId: string,
  message: WahaMessage
): Promise<WhatsappConversation | null> {
  const existing = await whatsappRepositories.findConversationOfChat(chatId);
  if (existing) return existing;

  const pushName = message.fromMe ? null : (message._data?.Info?.PushName ?? null);
  const created = whatsappDomain.createConversation({
    chatId,
    contactName: pushName,
    savedName: null,
    photoUrl: null,
    photoFetchedAt: null,
  });

  if (await whatsappRepositories.insertConversationIfNew(created)) {
    // The photo is a nicety: a failure here must not lose the message.
    fetchConversationPhoto(created).catch(reportSyncFailure);
  }

  return whatsappRepositories.findConversationOfChat(chatId);
}

async function saveLiveMessage(message: WahaMessage): Promise<void> {
  if (!whatsappSyncState.activePhone) return;

  const toSave = toWhatsappMessage(message);
  if (!toSave) return;

  const chatId = await resolveChatId(message);
  if (!chatId) return;

  const conversation = await conversationFor(chatId, message);
  if (!conversation) return;

  const saved = await whatsappRepositories.saveMessages(conversation.id, [toSave], true);
  if (saved > 0) notifyWhatsappChange();
}

async function applyEvent(event: WahaEvent): Promise<void> {
  if (event.event === "session.status") {
    if (event.payload.status === "WORKING") beginWhatsappSync();
    else stopWhatsappSync();
    notifyWhatsappChange();
    return;
  }

  if (event.event === "message.any") return saveLiveMessage(event.payload);

  if (event.event === "message.edited") {
    const { editedMessageId, body } = event.payload;
    if (!editedMessageId || body === null || body === undefined) return;

    const externalId = whatsappDomain.externalIdOf(editedMessageId);
    if (await whatsappRepositories.updateMessageContent({ externalId }, body)) {
      notifyWhatsappChange();
    }
    return;
  }

  if (event.event === "message.revoked") {
    const revokedId = event.payload.revokedMessageId ?? event.payload.after?.revokedMessageId;
    if (!revokedId) return;

    const externalId = whatsappDomain.externalIdOf(revokedId);
    if (await whatsappRepositories.markMessageDeleted({ externalId })) notifyWhatsappChange();
    return;
  }

  const { id, fromMe, ackName } = event.payload;
  const externalId = whatsappDomain.externalIdOf(id);
  const status = whatsappDomain.messageStatusOf(ackName);
  if (status === null) return;

  const isNowPlayed =
    ackName === "PLAYED" && (await whatsappRepositories.markMessagePlayed({ externalId }));

  const changed = fromMe
    ? await whatsappRepositories.advanceMessageStatus(externalId, status)
    : status === "read" && (await whatsappRepositories.markConversationReadByMessage(externalId));

  if (changed || isNowPlayed) notifyWhatsappChange();
}

export function handleWahaEvent(event: WahaEvent): void {
  applyEvent(event).catch(reportSyncFailure);
}
