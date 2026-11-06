import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  ensureMediaFits,
  findConversationToSendTo,
  saveSentMessage,
  sendThroughWaha,
} from "../helpers/sendToConversation";

type SendWhatsappMediaInput = {
  conversationId: string;
  content: Buffer;
  mimetype: string;
  filename: string;
  caption: string | undefined;
};

// The file passes through: it is sent to WAHA and forgotten, and only its name and caption stay.
export async function sendWhatsappMedia({
  conversationId,
  content,
  mimetype,
  filename,
  caption,
}: SendWhatsappMediaInput): Promise<void> {
  const conversation = await findConversationToSendTo(conversationId);
  ensureMediaFits(content);

  const kind = whatsappDomain.sendKindOf(mimetype);
  const safeFilename = whatsappDomain.safeFilenameOf(filename);
  const shownCaption = kind === "file" ? undefined : caption;

  const sent = await sendThroughWaha(() =>
    wahaClient.sendMedia({
      chatId: conversation.chatId,
      kind,
      file: { content, mimetype, filename: safeFilename },
      caption: shownCaption,
    })
  );
  if (!sent) return;

  await saveSentMessage(conversation.id, sent, {
    mediaFilename: safeFilename,
    type: whatsappDomain.MESSAGE_TYPE_BY_SEND_KIND[kind],
    content: shownCaption || null,
  });
}
