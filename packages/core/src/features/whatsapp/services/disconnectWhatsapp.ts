import { wahaClient } from "@vetra/infra";

import { connectionStatusOf } from "../domain";
import { callWaha } from "../helpers/callWaha";

export async function disconnectWhatsapp(): Promise<void> {
  const session = await callWaha(wahaClient.getSession);
  if (!session || connectionStatusOf(session.status) === "disconnected") return;

  await callWaha(wahaClient.logoutSession);
  // Logging out restarts the session, which would keep issuing QR Codes nobody asked for.
  await callWaha(wahaClient.stopSession);
}
