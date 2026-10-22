const MONTHS_PER_YEAR = 12;

// Recharts' own tick thinning skips labels unevenly; a fixed step keeps the gaps equal.
// minSpacing is roughly the widest label plus breathing room, in pixels.
export function evenlySpacedTicks(buckets: string[], plotWidth: number, minSpacing: number) {
  if (plotWidth <= 0) return buckets;
  const maxTicks = Math.max(2, Math.floor(plotWidth / minSpacing));
  const step = Math.ceil(buckets.length / maxTicks);
  return buckets.filter((_, index) => index % step === 0);
}

// Month labels carry no year, which is ambiguous once the axis spans more than one.
export function withYearOnLongMonthlyAxis<T extends { tick: string; minTickSpacing: number }>(
  formats: T,
  granularity: string,
  pointsCount: number
): T {
  if (granularity !== "month" || pointsCount <= MONTHS_PER_YEAR) return formats;
  return { ...formats, tick: "MMM/yy", minTickSpacing: 64 };
}
