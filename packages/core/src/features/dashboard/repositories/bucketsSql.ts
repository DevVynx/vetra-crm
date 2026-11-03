import { type SQL, sql } from "@vetra/database";

export type BucketUnit = "day" | "week" | "month" | "year";

// One row per calendar bucket (local day, Monday-based week, month or year in the profile time
// zone) from the bucket containing `start` up to now. Each row carries the instants that bound
// it, the first one clamped to `start`, so callers only compare instants. `now` is the
// application clock, the same one that stamps the rows being counted.
export function bucketsSql(start: Date, now: Date, unit: BucketUnit, timeZone: string): SQL {
  const localStart = sql`(${start.toISOString()}::timestamptz AT TIME ZONE ${timeZone})`;
  const localNow = sql`(${now.toISOString()}::timestamptz AT TIME ZONE ${timeZone})`;
  const step = sql`${`1 ${unit}`}::interval`;

  return sql`(
    SELECT
      GREATEST(local_start, ${localStart}) AT TIME ZONE ${timeZone} AS bucket_start,
      (local_start + ${step}) AT TIME ZONE ${timeZone} AS bucket_end
    FROM generate_series(date_trunc(${unit}, ${localStart}), ${localNow}, ${step}) AS local_start
  ) AS bucket`;
}
