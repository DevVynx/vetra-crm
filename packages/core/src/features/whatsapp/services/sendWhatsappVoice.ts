import { wahaClient, WahaSendRestrictedError } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMediaTooLargeError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { callWaha } from "../helpers/callWaha";
import { findMessageToReply } from "../helpers/findMessageToReply";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const SECOND_IN_MS = 1_000;

type SendWhatsappVoiceInput = {
  conversationId: string;
  content: Buffer;
  mimetype: string;
  seconds: number;
  replyToMessageId: string | undefined;
};

// The recording passes through like any file: it is sent to WAHA and forgotten.
export async function sendWhatsappVoice({
  conversationId,
  content,
  mimetype,
  seconds,
  replyToMessageId,
}: SendWhatsappVoiceInput): Promise<void> {
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();
  if (content.length > MAX_MEDIA_BYTES) throw new WhatsappMediaTooLargeError();

  const reply = replyToMessageId
    ? await findMessageToReply(conversation.id, replyToMessageId)
    : null;
  const filename = whatsappDomain.voiceFilenameOf(mimetype);

  let sent;
  try {
    sent = await callWaha(() =>
      wahaClient.sendVoice({
        chatId: conversation.chatId,
        file: { content, mimetype, filename },
        replyTo: reply ? whatsappDomain.wahaIdOf(reply, conversation.chatId) : undefined,
      })
    );
  } catch (error) {
    if (error instanceof WahaSendRestrictedError) throw new WhatsappSendRestrictedError();
    throw error;
  }
  if (!sent) return;

  await whatsappRepositories.saveMessages(
    conversation.id,
    [
      whatsappDomain.createMessage({
        externalId: whatsappDomain.externalIdOf(sent.id),
        wahaId: sent.id,
        mediaFilename: filename,
        mediaSeconds: seconds,
        isVoice: true,
        replyToExternalId: reply?.externalId ?? null,
        replyToContent: whatsappDomain.replySnippetOf(reply?.content ?? null),
        direction: "outbound",
        type: "audio",
        status: "sent",
        content: null,
        // WhatsApp's own time, so the order with what arrives next doesn't depend on this clock.
        sentAt: sent.sentAtSeconds ? new Date(sent.sentAtSeconds * SECOND_IN_MS) : new Date(),
      }),
    ],
    true
  );
  notifyWhatsappChange();
}
