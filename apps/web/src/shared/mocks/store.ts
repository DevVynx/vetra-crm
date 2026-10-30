import type { WonDeal } from "@vetra/contracts";

import {
  buildMockAwaitingConversations,
  buildMockExpenses,
  buildMockNextActions,
  buildMockNotes,
  buildMockProjects,
  buildMockWonDeals,
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

export const mockStore = {
  nextActions: buildMockNextActions(),
  notes: buildMockNotes(),
  wonDeals,
  expenses: buildMockExpenses(wonDeals, projects),
  projects,
  awaitingConversations: buildMockAwaitingConversations(),
};

export function openWonDeal(leadId: string, closedValueInCents: number, firstInstallmentDueAt: string) {
  const deal: WonDeal = {
    leadId,
    closedValueInCents,
    closedAt: new Date().toISOString(),
    installments: [
      { id: crypto.randomUUID(), amountInCents: closedValueInCents, dueAt: firstInstallmentDueAt, paidAt: null },
    ],
    monthlyFeeInCents: null,
    projectStatus: "in_production",
  };
  mockStore.wonDeals.push(deal);
}
