import {
  and,
  count,
  db,
  inArray,
  leadsTable,
  nextActionsTable,
  or,
  qualified,
  sql,
} from "@vetra/database";

import {
  containsSql,
  type Filter,
  type FilterColumns,
  filtersToSql,
} from "../../../shared/filters";
import { type Sort, type SortColumns, sortToSql } from "../../../shared/sort";
import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

export type LeadListRow = Lead & {
  nextAction: { description: string; dueAt: Date } | null;
};

type findLeadsPageInput = {
  visibleStageIds: string[];
  search: string;
  filters: Filter[];
  sort: Sort | undefined;
  timeZone: string;
  page: number;
  pageSize: number;
};

const hasNextAction = sql`EXISTS (SELECT 1 FROM ${nextActionsTable} WHERE ${nextActionsTable.leadId} = ${qualified(leadsTable.id)})`;

const leadFilterColumns: FilterColumns = {
  stage: { kind: "select", expression: sql`${leadsTable.stageId}` },
  niche: { kind: "select", expression: sql`${leadsTable.niche}` },
  city: { kind: "select", expression: sql`${leadsTable.city}` },
  next_action: { kind: "boolean", expression: hasNextAction },
  last_contact: { kind: "date", expression: sql`${leadsTable.lastContactAt}` },
  prospected_at: { kind: "date", expression: sql`${leadsTable.prospectedAt}` },
};

const leadSortColumns: SortColumns = {
  next_action: { kind: "value", expression: sql`next_action.due_at` },
  prospected_at: { kind: "value", expression: sql`${leadsTable.prospectedAt}` },
  last_contact: { kind: "value", expression: sql`${leadsTable.lastContactAt}` },
  business_name: { kind: "text", expression: sql`${leadsTable.businessName}` },
  niche: { kind: "text", expression: sql`${leadsTable.niche}` },
  city: { kind: "text", expression: sql`${leadsTable.city}` },
};

// The most urgent next action on top, then the leads without one.
const DEFAULT_SORT: Sort = { field: "next_action", direction: "asc" };

const searchSql = (search: string) =>
  search
    ? or(
        ...[leadsTable.businessName, leadsTable.contactName, leadsTable.niche, leadsTable.city].map(
          (column) => containsSql(sql`${column}`, search)
        )
      )
    : undefined;

// The earliest pending action of each lead, as a lateral subquery.
const nextActionSql = sql`(
  SELECT ${nextActionsTable.description} AS description, ${nextActionsTable.dueAt} AS due_at
  FROM ${nextActionsTable}
  WHERE ${nextActionsTable.leadId} = ${qualified(leadsTable.id)}
  ORDER BY ${nextActionsTable.dueAt}
  LIMIT 1
) AS next_action`;

export async function findLeadsPage({
  visibleStageIds,
  search,
  filters,
  sort = DEFAULT_SORT,
  timeZone,
  page,
  pageSize,
}: findLeadsPageInput): Promise<{ items: LeadListRow[]; total: number; page: number }> {
  const where = and(
    inArray(leadsTable.stageId, visibleStageIds),
    searchSql(search),
    filtersToSql(filters, leadFilterColumns, timeZone)
  );

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(leadsTable)
    .where(where);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));

  const rows = await db
    .select({
      ...leadColumns,
      nextActionDescription: sql<string | null>`next_action.description`,
      nextActionDueAt: sql<string | null>`next_action.due_at`,
    })
    .from(leadsTable)
    .leftJoin(sql`LATERAL ${nextActionSql}`, sql`true`)
    .where(where)
    .orderBy(sortToSql(sort, leadSortColumns), sql`${leadsTable.prospectedAt} DESC`, leadsTable.id)
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  const items = rows.map(({ nextActionDescription, nextActionDueAt, ...lead }) => ({
    ...lead,
    nextAction:
      nextActionDescription !== null && nextActionDueAt !== null
        ? { description: nextActionDescription, dueAt: new Date(nextActionDueAt) }
        : null,
  }));

  return { items, total, page: currentPage };
}
