import type { WhatsappQrCodeResponse } from "@vetra/contracts";
import { wahaClient } from "@vetra/infra";

import { connectionStatusOf } from "../domain";
import { WhatsappNotAwaitingQrError } from "../errors";
import { callWaha } from "../helpers/callWaha";

export async function getWhatsappQrCode(): Promise<WhatsappQrCodeResponse> {
  const session = await callWaha(wahaClient.getSession);
  if (!session || connectionStatusOf(session.status) !== "awaiting_qr") {
    throw new WhatsappNotAwaitingQrError();
  }

  const { mimetype, data } = await callWaha(wahaClient.getQrCode);
  return { image: `data:${mimetype};base64,${data}` };
}
