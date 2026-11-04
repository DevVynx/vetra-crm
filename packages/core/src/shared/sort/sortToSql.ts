import { type SQL, sql } from "@vetra/database";

export type SortDirection = "asc" | "desc";

export type Sort = {
  field: string;
  direction: SortDirection;
};

// How each sortable field of a list maps to SQL. Text ignores case and accents.
export type SortColumns = Record<string, { kind: "text" | "value"; expression: SQL }>;

// Empty values come last in either direction.
export function sortToSql({ field, direction }: Sort, columns: SortColumns): SQL {
  const column = columns[field];
  if (!column) throw new Error(`No sort column for field "${field}"`);

  const expression =
    column.kind === "text" ? sql`unaccent(lower(${column.expression}))` : column.expression;

  return direction === "asc"
    ? sql`${expression} ASC NULLS LAST`
    : sql`${expression} DESC NULLS LAST`;
}
