import { db, dealsTable, leadsTable, qualified, sql } from "@vetra/database";

import { bucketsSql, type BucketUnit } from "./bucketsSql";

type ProspectingRow = {
  bucket_start: string | Date;
  prospected_count: number;
  won_count: number;
};

// Leads prospected in each bucket, and how many of those became customers (they have a deal).
export async function findProspectingPoints(
  start: Date,
  now: Date,
  unit: BucketUnit,
  timeZone: string
) {
  const prospectedAt = qualified(leadsTable.prospectedAt);
  const inBucket = sql`${prospectedAt} >= bucket.bucket_start AND ${prospectedAt} < bucket.bucket_end
    AND ${prospectedAt} <= ${now.toISOString()}::timestamptz`;

  const { rows } = await db.execute<ProspectingRow>(sql`
    SELECT bucket.bucket_start,
      (SELECT COUNT(*)::int FROM ${leadsTable} WHERE ${inBucket}) AS prospected_count,
      (SELECT COUNT(*)::int FROM ${leadsTable}
        JOIN ${dealsTable} ON ${qualified(dealsTable.leadId)} = ${qualified(leadsTable.id)}
        WHERE ${inBucket}) AS won_count
    FROM ${bucketsSql(start, now, unit, timeZone)}
    ORDER BY bucket.bucket_start
  `);

  return (rows as ProspectingRow[]).map((row) => ({
    bucketStart: new Date(row.bucket_start),
    prospectedCount: Number(row.prospected_count),
    wonCount: Number(row.won_count),
  }));
}
