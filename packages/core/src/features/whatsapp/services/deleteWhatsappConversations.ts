import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { WhatsappStillConnectedError } from "../errors";
import { callWaha } from "../helpers/callWaha";
import { notifyWhatsappChange } from "../helpers/whatsappChanges";
import { whatsappRepositories } from "../repositories";

// While connected, the next sync would simply import everything again.
export async function deleteWhatsappConversations(): Promise<void> {
  const session = await callWaha(wahaClient.getSession);
  if (session && whatsappDomain.connectionStatusOf(session.status) === "connected") {
    throw new WhatsappStillConnectedError();
  }

  await whatsappRepositories.deleteWhatsappHistory();
  notifyWhatsappChange();
}
