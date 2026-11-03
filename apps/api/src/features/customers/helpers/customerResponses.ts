import type { CustomerDetail, CustomerListItem, DealPaymentRequest } from "@vetra/contracts";
import type {
  CustomerDetail as DomainCustomerDetail,
  CustomerListRow,
  DealPayment,
} from "@vetra/core";

import { toLeadDetail, toLeadSummary } from "@/features/leads/helpers/leadResponses";

export const toCustomerListItem = (row: CustomerListRow): CustomerListItem => ({
  ...toLeadSummary(row.lead),
  closedAt: row.deal.closedAt.toISOString(),
  closedValueInCents: row.deal.closedValueInCents,
  receivedInCents: row.receivedInCents,
  monthlyFeeInCents: row.deal.monthlyFeeInCents,
  activeProjectsCount: row.activeProjectsCount,
  projectsCount: row.projectsCount,
});

export const toCustomerDetail = (customer: DomainCustomerDetail): CustomerDetail => ({
  ...toLeadDetail(customer.lead),
  document: customer.deal.document,
  closedAt: customer.deal.closedAt.toISOString(),
  billing: customer.billing,
  projectMetrics: customer.projectMetrics,
  financial: customer.financial,
});

export const fromDealPayment = (payment: DealPaymentRequest): DealPayment => ({
  closedValueInCents: payment.closedValueInCents,
  receivedInCents: payment.receivedInCents,
  installmentsCount: payment.installmentsCount,
  firstInstallmentDueAt: payment.firstInstallmentDueAt
    ? new Date(payment.firstInstallmentDueAt)
    : null,
});
