import type { LeadWithPhoto } from "../../leads/domain";
import { customerDomain, type CustomerFinancial, type Deal } from "../domain";
import { CustomerNotFoundError } from "../errors";
import { customerRepositories } from "../repositories";

export type CustomerDetail = {
  lead: LeadWithPhoto;
  deal: Deal;
  billing: { receivedInCents: number; totalInCents: number; monthlyFeeInCents: number | null };
  projectMetrics: { total: number; active: number; completed: number };
  financial: CustomerFinancial;
};

export async function getCustomer(id: string): Promise<CustomerDetail> {
  const customer = await customerRepositories.findCustomerById(id);
  if (!customer) throw new CustomerNotFoundError();

  const figures = await customerRepositories.findCustomerFigures(id);
  const billing = customerDomain.billingOf(
    customer.deal,
    figures.installmentsTotalInCents,
    figures.receivedInCents
  );

  return {
    ...customer,
    billing: { ...billing, monthlyFeeInCents: customer.deal.monthlyFeeInCents },
    projectMetrics: {
      total: figures.projectsTotal,
      active: figures.projectsActive,
      completed: figures.projectsDelivered,
    },
    financial: customerDomain.financialOf(
      billing,
      figures.confirmedExpenseInCents,
      figures.pendingExpenseInCents
    ),
  };
}
