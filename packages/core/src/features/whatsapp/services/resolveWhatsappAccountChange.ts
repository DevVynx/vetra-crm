import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { WhatsappNoAccountChangeError } from "../errors";
import { callWaha } from "../helpers/callWaha";
import { beginWhatsappSync } from "../helpers/syncLoop";
import { whatsappRepositories } from "../repositories";
import { disconnectWhatsapp } from "./disconnectWhatsapp";

export async function resolveWhatsappAccountChange(decision: "replace" | "cancel"): Promise<void> {
  const session = await callWaha(wahaClient.getSession);
  const phone = session?.me ? whatsappDomain.phoneOfChatId(session.me.id) : null;
  const account = await whatsappRepositories.findWhatsappAccount();

  if (session?.status !== "WORKING" || !phone || !account || account.phone === phone) {
    throw new WhatsappNoAccountChangeError();
  }

  if (decision === "cancel") return disconnectWhatsapp();

  await whatsappRepositories.replaceWhatsappAccount(
    whatsappDomain.createAccount(phone, new Date())
  );
  beginWhatsappSync();
}
