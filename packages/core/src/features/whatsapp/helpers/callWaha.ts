import { WahaRequestRejectedError, WahaUnavailableError } from "@vetra/infra";

import { WhatsappActionRejectedError, WhatsappUnavailableError } from "../errors";

export async function callWaha<Result>(request: () => Promise<Result>): Promise<Result> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof WahaUnavailableError) throw new WhatsappUnavailableError();
    throw error;
  }
}

// For edits and deletes, where WhatsApp itself can refuse, with WAHA working fine.
export async function callWahaAction<Result>(request: () => Promise<Result>): Promise<Result> {
  try {
    return await callWaha(request);
  } catch (error) {
    if (error instanceof WahaRequestRejectedError) throw new WhatsappActionRejectedError();
    throw error;
  }
}
