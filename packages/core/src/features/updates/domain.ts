export type Release = {
  version: string;
  isPrerelease: boolean;
  url: string;
  publishedAt: string;
};

type ParsedVersion = { core: [number, number, number]; prerelease: string[] };

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

function parseVersion(text: string): ParsedVersion | null {
  const match = VERSION_PATTERN.exec(text);
  if (!match) return null;

  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

const isNumeric = (identifier: string) => /^\d+$/.test(identifier);

function comparePrereleaseIdentifier(a: string, b: string): number {
  if (isNumeric(a) && isNumeric(b)) return Math.sign(Number(a) - Number(b));
  // A number is lower than a text, as in semver.
  if (isNumeric(a)) return -1;
  if (isNumeric(b)) return 1;

  return a < b ? -1 : a > b ? 1 : 0;
}

// Semantic versioning: the numbers first; a version with a pre-release part (0.1.0-rc.1) is lower than the same
// one without it (0.1.0), and two pre-releases are compared part by part.
function compareParsed(a: ParsedVersion, b: ParsedVersion): number {
  for (let index = 0; index < 3; index++) {
    const difference = (a.core[index] ?? 0) - (b.core[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;

  const shared = Math.min(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < shared; index++) {
    const difference = comparePrereleaseIdentifier(
      a.prerelease[index] as string,
      b.prerelease[index] as string
    );
    if (difference !== 0) return difference;
  }

  return Math.sign(a.prerelease.length - b.prerelease.length);
}

// The newest release worth telling about. Someone on a stable version is only told of stable releases; someone on a
// pre-release is also told of newer pre-releases and of the stable one that follows. Never an older version.
// A version that is not a version (the "dev" of a build outside an image) has nothing to compare to.
function newestReleaseOver(releases: Release[], currentVersion: string): Release | null {
  const current = parseVersion(currentVersion);
  if (!current) return null;

  const isOnStable = current.prerelease.length === 0;
  let best: { release: Release; parsed: ParsedVersion } | null = null;

  for (const release of releases) {
    const parsed = parseVersion(release.version);
    if (!parsed || (isOnStable && release.isPrerelease)) continue;
    if (!best || compareParsed(parsed, best.parsed) > 0) best = { release, parsed };
  }

  return best && compareParsed(best.parsed, current) > 0 ? best.release : null;
}

const canBeCompared = (version: string) => parseVersion(version) !== null;

export const updateDomain = { canBeCompared, newestReleaseOver };
