import { and, type Column, gte, lte, sql } from "@vetra/database";

import type { DateRange } from "../domain";

// Both ends included; no range means "all time".
export const within = (column: Column, range: DateRange | null) =>
  range ? and(gte(column, range.start), lte(column, range.end)) : undefined;

export const sumOf = (column: Column) => sql<number>`COALESCE(SUM(${column}), 0)::int`;
