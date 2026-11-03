import { db, dealsTable, leadsTable, sql } from "@vetra/database";

type HistoryRow = { first_at: string | Date | null; months: number | null };

// When the history of sales or of prospecting began, and how many whole months ago that was
// in the profile time zone. Null when there is no history yet.
export async function findHistoryStart(
  source: "sales" | "prospecting",
  timeZone: string,
  now: Date
): Promise<{ firstAt: Date; months: number } | null> {
  const column = source === "sales" ? dealsTable.closedAt : leadsTable.prospectedAt;
  const table = source === "sales" ? dealsTable : leadsTable;
  const age = sql`age(${now.toISOString()}::timestamptz AT TIME ZONE ${timeZone}, MIN(${column}) AT TIME ZONE ${timeZone})`;

  const { rows } = await db.execute<HistoryRow>(sql`
    SELECT MIN(${column}) AS first_at,
      (EXTRACT(YEAR FROM ${age}) * 12 + EXTRACT(MONTH FROM ${age}))::int AS months
    FROM ${table}
  `);
  const [row] = rows as HistoryRow[];
  if (!row?.first_at) return null;

  return { firstAt: new Date(row.first_at), months: Number(row.months ?? 0) };
}
