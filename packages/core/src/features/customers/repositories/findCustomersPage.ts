import { and, count, db, dealsTable, eq, leadsTable, sql } from "@vetra/database";

import { type Filter, type FilterColumns, filtersToSql } from "../../../shared/filters";
import { type Sort, type SortColumns, sortToSql } from "../../../shared/sort";
import type { LeadWithPhoto } from "../../leads/domain";
import { leadSearchSql } from "../../leads/repositories/leadListWhere";
import type { Deal } from "../domain";
import {
  activeProjectsCountSql,
  customerColumns,
  projectsCountSql,
  receivedSql,
} from "./customerSql";

export type CustomerListRow = {
  lead: LeadWithPhoto;
  deal: Deal;
  receivedInCents: number;
  activeProjectsCount: number;
  projectsCount: number;
};

type findCustomersPageInput = {
  search: string;
  filters: Filter[];
  sort: Sort | undefined;
  timeZone: string;
  page: number;
  pageSize: number;
};

const customerFilterColumns: FilterColumns = {
  niche: { kind: "select", expression: sql`${leadsTable.niche}` },
  city: { kind: "select", expression: sql`${leadsTable.city}` },
  closed_value: { kind: "number", expression: sql`${dealsTable.closedValueInCents}` },
  monthly_fee: { kind: "boolean", expression: sql`${dealsTable.monthlyFeeInCents} IS NOT NULL` },
  active_project: { kind: "boolean", expression: sql`${activeProjectsCountSql} > 0` },
  closed_at: { kind: "date", expression: sql`${dealsTable.closedAt}` },
};

const customerSortColumns: SortColumns = {
  closed_at: { kind: "value", expression: sql`${dealsTable.closedAt}` },
  closed_value: { kind: "value", expression: sql`${dealsTable.closedValueInCents}` },
  received: { kind: "value", expression: sql`${receivedSql}` },
  monthly_fee: { kind: "value", expression: sql`${dealsTable.monthlyFeeInCents}` },
  business_name: { kind: "text", expression: sql`${leadsTable.businessName}` },
  niche: { kind: "text", expression: sql`${leadsTable.niche}` },
  city: { kind: "text", expression: sql`${leadsTable.city}` },
};

const DEFAULT_SORT: Sort = { field: "closed_at", direction: "desc" };

// Customers are the leads with a deal.
export async function findCustomersPage({
  search,
  filters,
  sort = DEFAULT_SORT,
  timeZone,
  page,
  pageSize,
}: findCustomersPageInput): Promise<{ items: CustomerListRow[]; total: number; page: number }> {
  const where = and(leadSearchSql(search), filtersToSql(filters, customerFilterColumns, timeZone));

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(leadsTable)
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(where);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));

  const items = await db
    .select({
      ...customerColumns,
      receivedInCents: receivedSql,
      activeProjectsCount: activeProjectsCountSql,
      projectsCount: projectsCountSql,
    })
    .from(leadsTable)
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(where)
    .orderBy(sortToSql(sort, customerSortColumns), leadsTable.id)
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  return { items, total, page: currentPage };
}
