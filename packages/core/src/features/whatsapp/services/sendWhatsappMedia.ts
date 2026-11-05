import { wahaClient, WahaSendRestrictedError } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import {
  WhatsappConversationNotFoundError,
  WhatsappMediaTooLargeError,
  WhatsappNotConnectedError,
  WhatsappSendRestrictedError,
} from "../errors";
import { callWaha } from "../helpers/callWaha";
import { whatsappSyncState } from "../helpers/syncLoop";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const SECOND_IN_MS = 1_000;

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
  const conversation = await whatsappRepositories.findConversationById(conversationId);
  if (!conversation) throw new WhatsappConversationNotFoundError();
  if (!whatsappSyncState.activePhone) throw new WhatsappNotConnectedError();
  if (content.length > MAX_MEDIA_BYTES) throw new WhatsappMediaTooLargeError();

  const kind = whatsappDomain.sendKindOf(mimetype);
  const safeFilename = whatsappDomain.safeFilenameOf(filename);
  const shownCaption = kind === "file" ? undefined : caption;

  let sent;
  try {
    sent = await callWaha(() =>
      wahaClient.sendMedia({
        chatId: conversation.chatId,
        kind,
        file: { content, mimetype, filename: safeFilename },
        caption: shownCaption,
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
        mediaFilename: safeFilename,
        direction: "outbound",
        type: whatsappDomain.MESSAGE_TYPE_BY_SEND_KIND[kind],
        status: "sent",
        content: shownCaption || null,
        // WhatsApp's own time, so the order with what arrives next doesn't depend on this clock.
        sentAt: sent.sentAtSeconds ? new Date(sent.sentAtSeconds * SECOND_IN_MS) : new Date(),
      }),
    ],
    true
  );
  notifyWhatsappChange();
}
