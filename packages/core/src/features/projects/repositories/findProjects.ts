import {
  and,
  db,
  desc,
  eq,
  expensesTable,
  installmentsTable,
  projectsTable,
  qualified,
  sql,
} from "@vetra/database";

import type { ProjectWithFinancial } from "../domain";

const revenueSql = (paid: boolean) => sql<number>`(
  SELECT COALESCE(SUM(${installmentsTable.amountInCents}), 0)::int FROM ${installmentsTable}
  WHERE ${installmentsTable.projectId} = ${qualified(projectsTable.id)}
    AND ${installmentsTable.paidAt} IS ${paid ? sql`NOT NULL` : sql`NULL`}
)`;

const expensesSql = sql<number>`(
  SELECT COALESCE(SUM(${expensesTable.amountInCents}), 0)::int FROM ${expensesTable}
  WHERE ${expensesTable.projectId} = ${qualified(projectsTable.id)} AND ${expensesTable.status} = 'confirmed'
)`;

const linkedEntriesSql = sql<number>`(
  (SELECT COUNT(*) FROM ${installmentsTable} WHERE ${installmentsTable.projectId} = ${qualified(projectsTable.id)})
  + (SELECT COUNT(*) FROM ${expensesTable} WHERE ${expensesTable.projectId} = ${qualified(projectsTable.id)})
)::int`;

type findProjectsInput = {
  leadId: string;
  projectId?: string;
};

// A customer's projects with their linked money; in production first, then newest start.
export async function findProjects({
  leadId,
  projectId,
}: findProjectsInput): Promise<ProjectWithFinancial[]> {
  const rows = await db
    .select({
      id: projectsTable.id,
      leadId: projectsTable.leadId,
      name: projectsTable.name,
      status: projectsTable.status,
      valueInCents: projectsTable.valueInCents,
      startedAt: projectsTable.startedAt,
      deliveredAt: projectsTable.deliveredAt,
      receivedInCents: revenueSql(true),
      pendingInCents: revenueSql(false),
      expensesInCents: expensesSql,
      linkedEntriesCount: linkedEntriesSql,
    })
    .from(projectsTable)
    .where(
      and(eq(projectsTable.leadId, leadId), projectId ? eq(projectsTable.id, projectId) : undefined)
    )
    .orderBy(sql`${projectsTable.status} = 'delivered'`, desc(projectsTable.startedAt));

  return rows.map(
    ({ receivedInCents, pendingInCents, expensesInCents, linkedEntriesCount, ...project }) => ({
      ...project,
      financial: { receivedInCents, pendingInCents, expensesInCents, linkedEntriesCount },
    })
  );
}
