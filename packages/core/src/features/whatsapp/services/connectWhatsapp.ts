import { wahaClient } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { callWaha } from "../helpers/callWaha";

export async function connectWhatsapp(): Promise<void> {
  const session = await callWaha(wahaClient.getSession);
  if (!session) return callWaha(wahaClient.createSession);

  if (whatsappDomain.connectionStatusOf(session.status) !== "disconnected") return;

  // A failed session usually lost its authorization, which a restart can't bring back.
  if (session.status !== "STOPPED") await callWaha(wahaClient.logoutSession);

  return callWaha(wahaClient.startSession);
}
