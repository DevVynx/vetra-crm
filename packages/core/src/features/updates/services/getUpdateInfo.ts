import { fetchPublishedReleases, ReleasesUnavailableError } from "@vetra/infra";

import { type Release, updateDomain } from "../domain";

export type UpdateInfo = {
  currentVersion: string;
  // False for a build that is not an image (development): there is nothing to compare.
  canCheck: boolean;
  checkFailed: boolean;
  hasUpdate: boolean;
  latestVersion: string | null;
  releaseUrl: string | null;
  publishedAt: string | null;
};

const SUCCESS_TTL_MS = 6 * 60 * 60 * 1000;
// A failed check is tried again soon, so a moment offline does not hide an update for hours.
const FAILURE_TTL_MS = 2 * 60 * 1000;
// "Verificar agora" is honored, but not more often than this, so it cannot be used to hammer the service.
const MIN_REFRESH_INTERVAL_MS = 30 * 1000;

type Check = { at: number; releases: Release[] | null };

let lastCheck: Check | null = null;

function isFresh(check: Check, now: number, refresh: boolean): boolean {
  const age = now - check.at;
  if (refresh) return age < MIN_REFRESH_INTERVAL_MS;

  return age < (check.releases ? SUCCESS_TTL_MS : FAILURE_TTL_MS);
}

async function checkReleases(refresh: boolean): Promise<Release[] | null> {
  const now = Date.now();
  if (lastCheck && isFresh(lastCheck, now, refresh)) return lastCheck.releases;

  try {
    lastCheck = { at: now, releases: await fetchPublishedReleases() };
  } catch (error) {
    if (!(error instanceof ReleasesUnavailableError)) throw error;
    lastCheck = { at: now, releases: null };
  }

  return lastCheck.releases;
}

// Which version is running and whether a newer one was published. Never fails: when the list cannot be read the answer
// says so, and the screen shows "could not check" instead of an error.
export async function getUpdateInfo(currentVersion: string, refresh = false): Promise<UpdateInfo> {
  const base = {
    currentVersion,
    hasUpdate: false,
    latestVersion: null,
    releaseUrl: null,
    publishedAt: null,
  };
  if (!updateDomain.canBeCompared(currentVersion)) {
    return { ...base, canCheck: false, checkFailed: false };
  }

  const releases = await checkReleases(refresh);
  if (!releases) return { ...base, canCheck: true, checkFailed: true };

  const newest = updateDomain.newestReleaseOver(releases, currentVersion);
  if (!newest) return { ...base, canCheck: true, checkFailed: false };

  return {
    ...base,
    canCheck: true,
    checkFailed: false,
    hasUpdate: true,
    latestVersion: newest.version,
    releaseUrl: newest.url,
    publishedAt: newest.publishedAt,
  };
}
