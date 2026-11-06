import { profileRoutes } from "@vetra/routes";
import { isAxiosError } from "axios";

import api from "@/shared/lib/axios/api";

import { useConnectionStore } from "./connectionStore";

const CHECK_TIMEOUT_MS = 4_000;
const SERVER_ERROR_STATUSES = [500, 502, 504];

// No answer at all, or an internal error. One screen's failure is not a lost server, so this only
// says that it is worth asking: see isServerReachable.
export function isConnectionProblem(error: unknown): boolean {
  if (!isAxiosError(error)) return false;

  return !error.response || SERVER_ERROR_STATUSES.includes(error.response.status);
}

// The profile is the cheapest thing the API answers from its database, so a server that is up but
// has no database fails this too.
export async function isServerReachable(): Promise<boolean> {
  try {
    await api.get(profileRoutes.base, { timeout: CHECK_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

let isChecking = false;

// Called for every failed query and mutation. Only a failure that looks like a lost server is
// checked, once at a time, and only if that check fails too is the server taken as lost.
export async function reportFailure(error: unknown): Promise<void> {
  if (!isConnectionProblem(error) || isChecking || useConnectionStore.getState().isLost) return;

  isChecking = true;
  try {
    if (!(await isServerReachable())) useConnectionStore.setState({ isLost: true });
  } finally {
    isChecking = false;
  }
}
