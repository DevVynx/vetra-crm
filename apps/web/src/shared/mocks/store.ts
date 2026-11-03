import type { DealPaymentRequest, Installment, WonDeal } from "@vetra/contracts";
import { addMonths } from "date-fns";

import {
  buildMockAwaitingConversations,
  buildMockExpenses,
  buildMockNextActions,
  buildMockNotes,
  buildMockProjects,
  buildMockWonDeals,
  linkMockEntriesToProjects,
} from "./fixtures";

const MOCK_LATENCY_IN_MS = 250;

export const respond = <T>(data: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), MOCK_LATENCY_IN_MS));

export const sumBy = <T>(items: T[], amountOf: (item: T) => number) =>
  items.reduce((total, item) => total + amountOf(item), 0);

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  return {
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    total: items.length,
    page: currentPage,
    pageSize,
  };
}

const wonDeals = buildMockWonDeals();
const projects = buildMockProjects(wonDeals);
linkMockEntriesToProjects(wonDeals, projects);

export const mockStore = {
  nextActions: buildMockNextActions(),
  notes: buildMockNotes(),
  wonDeals,
  expenses: buildMockExpenses(wonDeals, projects),
  projects,
  awaitingConversations: buildMockAwaitingConversations(),
};

const installmentsOf = (
  remainingInCents: number,
  count: number,
  firstDueAt: string
): Installment[] => {
  const base = Math.floor(remainingInCents / count);
  return Array.from({ length: count }, (_, index) => ({
    id: crypto.randomUUID(),
    amountInCents: index === count - 1 ? remainingInCents - base * (count - 1) : base,
    dueAt: addMonths(new Date(firstDueAt), index).toISOString(),
    paidAt: null,
    projectId: null,
    description: `Parcela ${index + 1} de ${count}`,
  }));
};

export function openWonDeal(
  leadId: string,
  {
    closedValueInCents,
    receivedInCents,
    installmentsCount,
    firstInstallmentDueAt,
  }: DealPaymentRequest
) {
  const closedAt = new Date().toISOString();
  const remainingInCents = closedValueInCents - receivedInCents;
  const installments: Installment[] = [];

  if (receivedInCents > 0) {
    installments.push({
      id: crypto.randomUUID(),
      amountInCents: receivedInCents,
      dueAt: closedAt,
      paidAt: closedAt,
      projectId: null,
      description: remainingInCents > 0 ? "Entrada" : "Pagamento à vista",
    });
  }
  if (remainingInCents > 0 && installmentsCount > 0 && firstInstallmentDueAt) {
    installments.push(
      ...installmentsOf(remainingInCents, installmentsCount, firstInstallmentDueAt)
    );
  }

  mockStore.wonDeals.push({
    leadId,
    closedValueInCents,
    closedAt,
    installments,
    monthlyFeeInCents: null,
    projectStatus: "in_production",
  } satisfies WonDeal);
}
