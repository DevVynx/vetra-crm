import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { findMessageToReply } from "../helpers/findMessageToReply";
import {
  ensureMediaFits,
  findConversationToSendTo,
  saveSentMessage,
  sendThroughWaha,
} from "../helpers/sendToConversation";

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
  const conversation = await findConversationToSendTo(conversationId);
  ensureMediaFits(content);

  const reply = replyToMessageId
    ? await findMessageToReply(conversation.id, replyToMessageId)
    : null;
  const filename = whatsappDomain.voiceFilenameOf(mimetype);

  const sent = await sendThroughWaha(() =>
    wahaClient.sendVoice({
      chatId: conversation.chatId,
      file: { content, mimetype, filename },
      replyTo: reply ? whatsappDomain.wahaIdOf(reply, conversation.chatId) : undefined,
    })
  );
  if (!sent) return;

  await saveSentMessage(conversation.id, sent, {
    mediaFilename: filename,
    mediaSeconds: seconds,
    isVoice: true,
    replyToExternalId: reply?.externalId ?? null,
    replyToContent: whatsappDomain.replySnippetOf(reply?.content ?? null),
    type: "audio",
    content: null,
  });
}
