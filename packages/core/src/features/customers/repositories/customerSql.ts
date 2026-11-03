import {
  dealsTable,
  installmentsTable,
  leadsTable,
  projectsTable,
  qualified,
  sql,
} from "@vetra/database";

import { leadColumns } from "../../leads/repositories/leadColumns";

export const dealColumns = {
  id: dealsTable.id,
  leadId: dealsTable.leadId,
  closedAt: dealsTable.closedAt,
  closedValueInCents: dealsTable.closedValueInCents,
  document: dealsTable.document,
  monthlyFeeInCents: dealsTable.monthlyFeeInCents,
};

export const customerColumns = { lead: leadColumns, deal: dealColumns };

// Per-customer figures computed in the database, correlated to the current lead row.
export const receivedSql = sql<number>`(
  SELECT COALESCE(SUM(${installmentsTable.amountInCents}), 0)::int FROM ${installmentsTable}
  WHERE ${installmentsTable.leadId} = ${qualified(leadsTable.id)} AND ${installmentsTable.paidAt} IS NOT NULL
)`;

export const projectsCountSql = sql<number>`(
  SELECT COUNT(*)::int FROM ${projectsTable} WHERE ${projectsTable.leadId} = ${qualified(leadsTable.id)}
)`;

export const activeProjectsCountSql = sql<number>`(
  SELECT COUNT(*)::int FROM ${projectsTable}
  WHERE ${projectsTable.leadId} = ${qualified(leadsTable.id)} AND ${projectsTable.status} = 'in_production'
)`;
