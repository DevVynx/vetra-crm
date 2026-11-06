import { envConfig } from "@vetra/env/server";

import { ReleasesUnavailableError } from "./ReleasesUnavailableError";

const REQUEST_TIMEOUT_MS = 5_000;

export type PublishedRelease = {
  version: string;
  isPrerelease: boolean;
  url: string;
  publishedAt: string;
};

type RawRelease = {
  tag_name?: unknown;
  prerelease?: unknown;
  draft?: unknown;
  html_url?: unknown;
  published_at?: unknown;
};

function toPublishedRelease(raw: RawRelease): PublishedRelease | null {
  if (raw.draft === true) return null;
  if (
    typeof raw.tag_name !== "string" ||
    typeof raw.html_url !== "string" ||
    typeof raw.published_at !== "string"
  ) {
    return null;
  }

  return {
    version: raw.tag_name.replace(/^v/, ""),
    isPrerelease: raw.prerelease === true,
    url: raw.html_url,
    publishedAt: raw.published_at,
  };
}

// Reads the public list of releases (no key is needed). Whatever goes wrong, offline, a limit of the service or an
// answer that is not a list, is one error: the screen only says the check could not be made.
export async function fetchPublishedReleases(): Promise<PublishedRelease[]> {
  try {
    const response = await fetch(envConfig.get().VETRA_RELEASES_URL, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "vetra-crm" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new ReleasesUnavailableError();

    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new ReleasesUnavailableError();

    return body.flatMap((raw) => toPublishedRelease(raw as RawRelease) ?? []);
  } catch {
    throw new ReleasesUnavailableError();
  }
}
