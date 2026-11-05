import { envConfig } from "@vetra/env/waha";
import type { z } from "zod";

import { WahaRequestRejectedError } from "./WahaRequestRejectedError";
import { WahaUnavailableError } from "./WahaUnavailableError";

const REQUEST_TIMEOUT_MS = 5_000;

export const WAHA_SESSION = "default";

let lastReportedFailure: string | null = null;

// The status is polled every few seconds, so only a change is logged. Paths stay out of the log
// because they can carry a phone number.
function failWith(failure: string): never {
  if (failure !== lastReportedFailure) {
    lastReportedFailure = failure;
    console.error(`WAHA request failed: ${failure}`);
  }

  throw new WahaUnavailableError();
}

const describeStatus = (status: number) =>
  status === 401 ? "invalid API key, check WAHA_API_KEY" : `responded with ${status}`;

export async function wahaFetch(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown,
  timeoutMs: number = REQUEST_TIMEOUT_MS
) {
  const { WAHA_URL, WAHA_API_KEY } = envConfig.get();

  try {
    return await fetch(`${WAHA_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return failWith("not reachable");
  }
}

export async function wahaCommand(path: string, body?: unknown) {
  const response = await wahaFetch(path, "POST", body);
  if (!response.ok) failWith(describeStatus(response.status));

  lastReportedFailure = null;
}

// For actions whose answer carries nothing: a refusal from WhatsApp is not WAHA being down.
export function ensureWahaAccepted(response: Response): void {
  if (response.status === 401) failWith(describeStatus(response.status));
  if (!response.ok) throw new WahaRequestRejectedError();

  lastReportedFailure = null;
}

export async function parseWahaResponse<Schema extends z.ZodType>(
  response: Response,
  schema: Schema
): Promise<z.infer<Schema>> {
  if (!response.ok) failWith(describeStatus(response.status));

  try {
    const parsed = schema.parse(await response.json());
    lastReportedFailure = null;
    return parsed;
  } catch {
    return failWith("unexpected response");
  }
}
