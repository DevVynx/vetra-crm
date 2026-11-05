import type { WhatsappStatusResponse } from "@vetra/contracts";
import { wahaClient, WahaUnavailableError } from "@vetra/infra";

import { whatsappDomain } from "../domain";
import { whatsappSyncState } from "../helpers/syncLoop";
import { whatsappRepositories } from "../repositories";

const NOT_CONNECTED = { phone: null, importing: false, pendingAccountChange: null };

async function pendingChangeFor(phone: string | null) {
  const account = phone ? await whatsappRepositories.findWhatsappAccount() : null;
  if (!account || account.phone === phone) return null;

  const hasConversations = (await whatsappRepositories.countWhatsappConversations()) > 0;
  return hasConversations ? { previousPhone: account.phone } : null;
}

export async function getWhatsappStatus(): Promise<WhatsappStatusResponse> {
  try {
    const session = await wahaClient.getSession();
    if (!session) return { status: "disconnected", ...NOT_CONNECTED };

    const status = whatsappDomain.connectionStatusOf(session.status);
    if (status !== "connected") return { status, ...NOT_CONNECTED };

    const phone = session.me ? whatsappDomain.phoneOfChatId(session.me.id) : null;

    return {
      status,
      phone,
      importing: whatsappSyncState.importing,
      pendingAccountChange: await pendingChangeFor(phone),
    };
  } catch (error) {
    if (error instanceof WahaUnavailableError) return { status: "unavailable", ...NOT_CONNECTED };
    throw error;
  }
}
