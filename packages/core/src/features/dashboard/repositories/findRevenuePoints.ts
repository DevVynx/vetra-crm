import { db, dealsTable, installmentsTable, sql } from "@vetra/database";

import { bucketsSql, type BucketUnit } from "./bucketsSql";

type RevenueRow = {
  bucket_start: string | Date;
  received_in_cents: number;
  sold_in_cents: number;
};

// Cumulative since `start`: each point adds everything up to the end of its bucket (or now).
export async function findRevenuePoints(
  start: Date,
  now: Date,
  unit: BucketUnit,
  timeZone: string
) {
  const from = sql`${start.toISOString()}::timestamptz`;
  const upToBucket = (column: unknown) =>
    sql`${column} >= ${from} AND ${column} < bucket.bucket_end AND ${column} <= ${now.toISOString()}::timestamptz`;

  const { rows } = await db.execute<RevenueRow>(sql`
    SELECT bucket.bucket_start,
      (SELECT COALESCE(SUM(${installmentsTable.amountInCents}), 0)::int FROM ${installmentsTable}
        WHERE ${upToBucket(installmentsTable.paidAt)}) AS received_in_cents,
      (SELECT COALESCE(SUM(${dealsTable.closedValueInCents}), 0)::int FROM ${dealsTable}
        WHERE ${upToBucket(dealsTable.closedAt)}) AS sold_in_cents
    FROM ${bucketsSql(start, now, unit, timeZone)}
    ORDER BY bucket.bucket_start
  `);

  return (rows as RevenueRow[]).map((row) => ({
    bucketStart: new Date(row.bucket_start),
    receivedInCents: Number(row.received_in_cents),
    soldInCents: Number(row.sold_in_cents),
  }));
}
