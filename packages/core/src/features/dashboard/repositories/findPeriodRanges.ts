import { db, type SQL, sql } from "@vetra/database";

import type { DashboardPeriod, DateRange } from "../domain";

type LocalRange = { start: SQL; end: SQL };

// Period boundaries are local calendar boundaries in the profile time zone ("this month" starts
// at local midnight of the 1st), computed by Postgres so daylight saving time is handled. The
// previous range stops at the same point of its period, so an unfinished period is not
// compared with a whole one.
function localRangesOf(period: Exclude<DashboardPeriod, "all_time">, localNow: SQL) {
  const calendar = (unit: "week" | "month" | "year"): [LocalRange, LocalRange] => {
    const start = sql`date_trunc(${unit}, ${localNow})`;
    const step = sql`${`1 ${unit}`}::interval`;
    return [
      { start, end: localNow },
      { start: sql`${start} - ${step}`, end: sql`${localNow} - ${step}` },
    ];
  };

  switch (period) {
    case "week":
      return calendar("week");
    case "month":
      return calendar("month");
    case "year":
      return calendar("year");
    case "six_months": {
      const start = sql`${localNow} - interval '6 months'`;
      return [
        { start, end: localNow },
        { start: sql`${localNow} - interval '12 months'`, end: start },
      ] satisfies [LocalRange, LocalRange];
    }
  }
}

type RangesRow = {
  current_start: string | Date;
  current_end: string | Date;
  previous_start: string | Date;
  previous_end: string | Date;
};

export async function findPeriodRanges(
  period: DashboardPeriod,
  timeZone: string,
  now: Date
): Promise<{ current: DateRange | null; previous: DateRange | null }> {
  if (period === "all_time") return { current: null, previous: null };

  // The application clock, the same one that stamps closings and payments.
  const localNow = sql`(${now.toISOString()}::timestamptz AT TIME ZONE ${timeZone})`;
  const [current, previous] = localRangesOf(period, localNow);
  const toInstant = (local: SQL) => sql`(${local}) AT TIME ZONE ${timeZone}`;

  const { rows } = await db.execute<RangesRow>(sql`
    SELECT ${toInstant(current.start)} AS current_start, ${toInstant(current.end)} AS current_end,
      ${toInstant(previous.start)} AS previous_start, ${toInstant(previous.end)} AS previous_end
  `);
  const [row] = rows as RangesRow[];
  if (!row) throw new Error("Postgres returned no period range");

  return {
    current: { start: new Date(row.current_start), end: new Date(row.current_end) },
    previous: { start: new Date(row.previous_start), end: new Date(row.previous_end) },
  };
}
