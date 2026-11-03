import { type Column, getTableName, sql } from "drizzle-orm";
import { toSnakeCase } from "drizzle-orm/casing";

// Drizzle drops the table name from columns in the select list of single-table queries, so an
// outer column inside a correlated subquery ("id") would resolve to the inner table instead.
// Use this for every outer-row reference in a subquery: it always renders "table"."column".
// Columns declared without an explicit name get it from their key, converted with the same
// snake_case casing the client is configured with.
export const qualified = (column: Column) =>
  sql`${sql.identifier(getTableName(column.table))}.${sql.identifier(
    column.keyAsName ? toSnakeCase(column.name) : column.name
  )}`;
