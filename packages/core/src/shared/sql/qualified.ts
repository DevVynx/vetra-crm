import { type Column, getTableName, sql } from "@vetra/database";

// Drizzle drops the table name from columns in the select list of single-table queries, so an
// outer column inside a correlated subquery ("id") would resolve to the inner table instead.
// Use this for every outer-row reference in a subquery: it always renders "table"."column".
export const qualified = (column: Column) =>
  sql`${sql.identifier(getTableName(column.table))}.${sql.identifier(column.name)}`;
