import { db, eq, expensesTable, installmentsTable, projectsTable, sql } from "@vetra/database";

export type CustomerFigures = {
  installmentsTotalInCents: number;
  receivedInCents: number;
  confirmedExpenseInCents: number;
  pendingExpenseInCents: number;
  projectsTotal: number;
  projectsActive: number;
  projectsDelivered: number;
};

const sumWhen = (amount: unknown, condition: ReturnType<typeof sql>) =>
  sql<number>`COALESCE(SUM(${amount}) FILTER (WHERE ${condition}), 0)::int`;

// Money and project counts of one customer, aggregated in the database.
export async function findCustomerFigures(leadId: string): Promise<CustomerFigures> {
  const [[installments], [expenses], [projects]] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(SUM(${installmentsTable.amountInCents}), 0)::int`,
        received: sumWhen(
          installmentsTable.amountInCents,
          sql`${installmentsTable.paidAt} IS NOT NULL`
        ),
      })
      .from(installmentsTable)
      .where(eq(installmentsTable.leadId, leadId)),
    db
      .select({
        confirmed: sumWhen(expensesTable.amountInCents, sql`${expensesTable.status} = 'confirmed'`),
        pending: sumWhen(expensesTable.amountInCents, sql`${expensesTable.status} = 'pending'`),
      })
      .from(expensesTable)
      .where(eq(expensesTable.leadId, leadId)),
    db
      .select({
        total: sql<number>`COUNT(*)::int`,
        active: sql<number>`(COUNT(*) FILTER (WHERE ${projectsTable.status} = 'in_production'))::int`,
        delivered: sql<number>`(COUNT(*) FILTER (WHERE ${projectsTable.status} = 'delivered'))::int`,
      })
      .from(projectsTable)
      .where(eq(projectsTable.leadId, leadId)),
  ]);

  return {
    installmentsTotalInCents: installments?.total ?? 0,
    receivedInCents: installments?.received ?? 0,
    confirmedExpenseInCents: expenses?.confirmed ?? 0,
    pendingExpenseInCents: expenses?.pending ?? 0,
    projectsTotal: projects?.total ?? 0,
    projectsActive: projects?.active ?? 0,
    projectsDelivered: projects?.delivered ?? 0,
  };
}
