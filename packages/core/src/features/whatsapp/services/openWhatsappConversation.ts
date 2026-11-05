import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { WhatsappNotConnectedError, WhatsappNumberNotFoundError } from "../errors";
import { callWaha } from "../helpers/callWaha";
import { fetchConversationPhoto } from "../helpers/fetchConversationPhoto";
import { reportSyncFailure, whatsappSyncState } from "../helpers/syncLoop";
import { whatsappRepositories } from "../repositories";
import { getWhatsappConversation } from "./getWhatsappConversation";

async function createConversationFor(phone: string) {
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();

  // WhatsApp decides the real id: Brazilian numbers may exist with or without the ninth digit.
  const chatId = await callWaha(() => wahaClient.findChatIdOfPhone(phone));
  if (!chatId) throw new WhatsappNumberNotFoundError();

  const created = whatsappDomain.createConversation({
    chatId,
    contactName: null,
    savedName: null,
    photoUrl: null,
    photoFetchedAt: null,
  });

  if (await whatsappRepositories.insertConversationIfNew(created)) {
    fetchConversationPhoto(created).catch(reportSyncFailure);
    return created;
  }

  return (await whatsappRepositories.findConversationByChatId(chatId)) ?? created;
}

export async function openWhatsappConversation(phone: string) {
  const existing = await whatsappRepositories.findConversationByPhoneKey(
    whatsappDomain.canonicalPhoneOf(phone)
  );
  const conversation = existing ?? (await createConversationFor(phone));

  return getWhatsappConversation(conversation.id);
}
