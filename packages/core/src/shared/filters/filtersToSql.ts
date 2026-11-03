import { and, type SQL, sql } from "@vetra/database";

import type { Filter, FilterValue } from "./types";

export type FilterKind = "select" | "text" | "number" | "date" | "boolean";

// How each filterable field of a list maps to SQL: the expression to compare and its kind.
export type FilterColumns = Record<string, { kind: FilterKind; expression: SQL }>;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const containsSql = (expression: SQL, text: string) =>
  sql`unaccent(lower(${expression})) LIKE unaccent(lower(${`%${escapeLike(text)}%`}))`;

const listOf = (values: FilterValue[]) =>
  sql.join(
    values.map((value) => sql`${value}`),
    sql`, `
  );

// Dates are compared by calendar day in the profile time zone, never in the server's.
const dayOf = (expression: SQL, timeZone: string) =>
  sql`((${expression}) AT TIME ZONE ${timeZone})::date`;
const dayOfValue = (value: FilterValue, timeZone: string) =>
  dayOf(sql`${String(value)}::timestamptz`, timeZone);

const isTrue = (value: FilterValue) => String(value) === "true";

function filterToSql(
  { operator, values }: Filter,
  { kind, expression }: FilterColumns[string],
  timeZone: string
): SQL {
  const [first = "", second = first] = values;
  const orMissing = (condition: SQL) => sql`(${expression} IS NULL OR ${condition})`;

  switch (operator) {
    case "is":
      return kind === "boolean"
        ? sql`(${expression}) = ${isTrue(first)}`
        : sql`${expression} = ${first}`;
    case "is_not":
      return orMissing(sql`${expression} <> ${first}`);
    case "is_any_of":
      return sql`${expression} IN (${listOf(values)})`;
    case "is_none_of":
      return orMissing(sql`${expression} NOT IN (${listOf(values)})`);
    case "contains":
      return containsSql(expression, String(first));
    case "not_contains":
      return orMissing(sql`NOT ${containsSql(expression, String(first))}`);
    case "eq":
      return sql`${expression} = ${Number(first)}`;
    case "gt":
      return sql`${expression} > ${Number(first)}`;
    case "lt":
      return sql`${expression} < ${Number(first)}`;
    case "between":
      return kind === "number"
        ? sql`${expression} BETWEEN ${Number(first)} AND ${Number(second)}`
        : sql`${dayOf(expression, timeZone)} BETWEEN ${dayOfValue(first, timeZone)} AND ${dayOfValue(second, timeZone)}`;
    case "before":
      return sql`${dayOf(expression, timeZone)} < ${dayOfValue(first, timeZone)}`;
    case "after":
      return sql`${dayOf(expression, timeZone)} > ${dayOfValue(first, timeZone)}`;
    case "last_days":
      return sql`${dayOf(sql`now()`, timeZone)} - ${dayOf(expression, timeZone)} BETWEEN 0 AND ${Number(first)}`;
  }
}

// Every filter must match (AND); the values inside one filter are alternatives (OR).
export function filtersToSql(
  filters: Filter[],
  columns: FilterColumns,
  timeZone: string
): SQL | undefined {
  return and(
    ...filters.map((filter) => {
      const column = columns[filter.field];
      if (!column) throw new Error(`No filter column for field "${filter.field}"`);
      return filterToSql(filter, column, timeZone);
    })
  );
}
