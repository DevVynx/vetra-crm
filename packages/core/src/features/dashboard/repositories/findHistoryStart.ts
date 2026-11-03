import { db, dealsTable, installmentsTable, leadsTable, sql } from "@vetra/database";

type HistoryRow = { first_at: string | Date | null; months: number | null };

// When the history began, and how many whole months ago that was in the profile time zone.
// Revenue starts at the first sale or the first payment, whichever came first: a payment can be
// registered by hand with a date before any closing. Null when there is no history yet.
export async function findHistoryStart(
  source: "revenue" | "prospecting",
  timeZone: string,
  now: Date
): Promise<{ firstAt: Date; months: number } | null> {
  const firstAt =
    source === "revenue"
      ? sql`LEAST(
          (SELECT MIN(${dealsTable.closedAt}) FROM ${dealsTable}),
          (SELECT MIN(${installmentsTable.paidAt}) FROM ${installmentsTable})
        )`
      : sql`(SELECT MIN(${leadsTable.prospectedAt}) FROM ${leadsTable})`;
  const age = sql`age(${now.toISOString()}::timestamptz AT TIME ZONE ${timeZone}, history.first_at AT TIME ZONE ${timeZone})`;

  const { rows } = await db.execute<HistoryRow>(sql`
    SELECT history.first_at,
      (EXTRACT(YEAR FROM ${age}) * 12 + EXTRACT(MONTH FROM ${age}))::int AS months
    FROM (SELECT ${firstAt} AS first_at) AS history
  `);
  const [row] = rows as HistoryRow[];
  if (!row?.first_at) return null;

  return { firstAt: new Date(row.first_at), months: Number(row.months ?? 0) };
}
