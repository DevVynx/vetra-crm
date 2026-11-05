import { WahaUnavailableError } from "@vetra/infra";

import { WhatsappUnavailableError } from "../errors";

export async function callWaha<Result>(request: () => Promise<Result>): Promise<Result> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof WahaUnavailableError) throw new WhatsappUnavailableError();
    throw error;
  }
}
