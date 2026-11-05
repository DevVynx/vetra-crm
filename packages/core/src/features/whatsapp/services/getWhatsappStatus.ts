import type { WhatsappStatusResponse } from "@vetra/contracts";
import { wahaClient, WahaUnavailableError } from "@vetra/infra";

import { connectionStatusOf, phoneOfWhatsappId } from "../domain";

export async function getWhatsappStatus(): Promise<WhatsappStatusResponse> {
  try {
    const session = await wahaClient.getSession();
    if (!session) return { status: "disconnected", phone: null };

    const status = connectionStatusOf(session.status);
    const phone = status === "connected" && session.me ? phoneOfWhatsappId(session.me.id) : null;

    return { status, phone };
  } catch (error) {
    if (error instanceof WahaUnavailableError) return { status: "unavailable", phone: null };
    throw error;
  }
}
