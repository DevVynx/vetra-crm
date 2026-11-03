import { and, count, db, dealsTable, desc, eq, leadsTable, or, sql } from "@vetra/database";

import {
  containsSql,
  type Filter,
  type FilterColumns,
  filtersToSql,
} from "../../../shared/filters";
import type { Lead } from "../../leads/domain";
import type { Deal } from "../domain";
import {
  activeProjectsCountSql,
  customerColumns,
  projectsCountSql,
  receivedSql,
} from "./customerSql";

export type CustomerListRow = {
  lead: Lead;
  deal: Deal;
  receivedInCents: number;
  activeProjectsCount: number;
  projectsCount: number;
};

type findCustomersPageInput = {
  search: string;
  filters: Filter[];
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

const searchSql = (search: string) =>
  search
    ? or(
        ...[leadsTable.businessName, leadsTable.contactName, leadsTable.niche, leadsTable.city].map(
          (column) => containsSql(sql`${column}`, search)
        )
      )
    : undefined;

// Customers are the leads with a deal, newest closing first.
export async function findCustomersPage({
  search,
  filters,
  timeZone,
  page,
  pageSize,
}: findCustomersPageInput): Promise<{ items: CustomerListRow[]; total: number; page: number }> {
  const where = and(searchSql(search), filtersToSql(filters, customerFilterColumns, timeZone));

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
    .orderBy(desc(dealsTable.closedAt), leadsTable.id)
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);

  return { items, total, page: currentPage };
}
