import type {
  CreateCustomerProjectRequest,
  CreateCustomerRequest,
  CreateLedgerEntryRequest,
  CustomerDetail,
  CustomerListFilter,
  CustomerListItem,
  CustomerProject,
  LeadSummary,
  LedgerEntry,
  ListCustomerProjectsResponse,
  ListCustomersQuery,
  ListCustomersResponse,
  ListLedgerEntriesResponse,
  UpdateCustomerRequest,
  UpdateLedgerEntryRequest,
  WonDeal,
} from "@vetra/contracts";

import { addMockLead, leadContactFor, mockCustomerDocuments, mockLeads, updateMockLead } from "./fixtures";
import { mockStore, normalizeText, openWonDeal, paginate, respond, sumBy } from "./store";


const CLIENT_FILTERS: CustomerListFilter[] = ["all", "with_active_project", "without_active_project"];

const findDeal = (id: string): WonDeal => {
  const found = mockStore.wonDeals.find((deal) => deal.leadId === id);
  if (!found) throw new Error(`Customer ${id} not found`);
  return found;
};

const findLead = (id: string) => {
  const found = mockLeads.find((lead) => lead.id === id);
  if (!found) throw new Error(`Customer ${id} not found`);
  return found;
};

const projectsOf = (leadId: string) =>
  mockStore.projects.filter((project) => project.leadId === leadId);

const activeProjectsOf = (leadId: string) =>
  projectsOf(leadId).filter((project) => project.status === "in_production");

const totalOf = (deal: WonDeal) => sumBy(deal.installments, (item) => item.amountInCents);
const receivedOf = (deal: WonDeal) =>
  sumBy(
    deal.installments.filter((item) => item.paidAt !== null),
    (item) => item.amountInCents
  );

const revenueEntriesOf = (deal: WonDeal): LedgerEntry[] => {
  const dealProjects = projectsOf(deal.leadId);

  return deal.installments.map((item, index) => ({
    id: item.id,
    type: "revenue",
    description:
      item.description ??
      (deal.installments.length === 1
        ? "Pagamento do projeto"
        : `Parcela ${index + 1} de ${deal.installments.length}`),
    amountInCents: item.amountInCents,
    status: item.paidAt ? "confirmed" : "pending",
    occurredAt: item.paidAt ?? item.dueAt,
    createdAt: item.createdAt ?? deal.closedAt,
    projectName: dealProjects[index % dealProjects.length]?.name ?? null,
  }));
};

const revenueOrExpenseEntry = (id: string, entryId: string): LedgerEntry => {
  const entry = [...revenueEntriesOf(findDeal(id)), ...(mockStore.expenses[id] ?? [])].find(
    (item) => item.id === entryId
  );
  if (!entry) throw new Error(`Entry ${entryId} not found`);
  return entry;
};

const matchesFilter = (leadId: string, filter: CustomerListFilter) => {
  if (filter === "all") return true;
  const hasActive = activeProjectsOf(leadId).length > 0;
  return filter === "with_active_project" ? hasActive : !hasActive;
};

export const customersMockApi = {
  listCustomers({ q, filter, page, pageSize }: ListCustomersQuery): Promise<ListCustomersResponse> {
    const search = normalizeText(q);
    const items = mockStore.wonDeals
      .filter((deal) => matchesFilter(deal.leadId, filter))
      .map((deal): CustomerListItem => {
        const lead = findLead(deal.leadId);
        return {
          ...lead,
          closedAt: deal.closedAt,
          closedValueInCents: deal.closedValueInCents,
          receivedInCents: receivedOf(deal),
          monthlyFeeInCents: deal.monthlyFeeInCents,
          activeProjectsCount: activeProjectsOf(deal.leadId).length,
          projectsCount: projectsOf(deal.leadId).length,
        };
      })
      .filter((customer) =>
        [customer.businessName, customer.contactName ?? "", customer.niche, customer.city].some((field) =>
          normalizeText(field).includes(search)
        )
      )
      .sort((a, b) => b.closedAt.localeCompare(a.closedAt));

    const counts = Object.fromEntries(
      CLIENT_FILTERS.map((option) => [
        option,
        mockStore.wonDeals.filter((deal) => matchesFilter(deal.leadId, option)).length,
      ])
    ) as ListCustomersResponse["counts"];

    return respond({ ...paginate(items, page, pageSize), counts });
  },

  getCustomer(id: string): Promise<CustomerDetail> {
    const deal = findDeal(id);
    const lead = findLead(id);
    const projects = projectsOf(id);
    const expenses = mockStore.expenses[id] ?? [];
    const sumExpenses = (status: LedgerEntry["status"]) =>
      sumBy(
        expenses.filter((entry) => entry.status === status),
        (entry) => entry.amountInCents
      );
    const confirmedRevenue = receivedOf(deal);
    const confirmedExpense = sumExpenses("confirmed");

    return respond({
      ...lead,
      ...leadContactFor(lead),
      document: mockCustomerDocuments[id] ?? null,
      closedAt: deal.closedAt,
      billing: {
        receivedInCents: confirmedRevenue,
        totalInCents: totalOf(deal),
        monthlyFeeInCents: deal.monthlyFeeInCents,
      },
      projectMetrics: {
        total: projects.length,
        active: projects.filter((project) => project.status === "in_production").length,
        completed: projects.filter((project) => project.status === "delivered").length,
      },
      financial: {
        confirmedRevenueInCents: confirmedRevenue,
        pendingRevenueInCents: totalOf(deal) - confirmedRevenue,
        confirmedExpenseInCents: confirmedExpense,
        pendingExpenseInCents: sumExpenses("pending"),
        balanceInCents: confirmedRevenue - confirmedExpense,
      },
    });
  },

  listCustomerLedger(id: string): Promise<ListLedgerEntriesResponse> {
    const deal = findDeal(id);
    const entries = [...revenueEntriesOf(deal), ...(mockStore.expenses[id] ?? [])];
    return respond({ entries: entries.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) });
  },

  listCustomerProjects(id: string): Promise<ListCustomerProjectsResponse> {
    findDeal(id);
    const projects = projectsOf(id)
      .map(({ leadId: _leadId, ...project }) => project)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "in_production" ? -1 : 1;
        return b.startedAt.localeCompare(a.startedAt);
      });
    return respond({ projects });
  },

  createLedgerEntry(id: string, request: CreateLedgerEntryRequest): Promise<LedgerEntry> {
    const deal = findDeal(id);
    const createdAt = new Date().toISOString();
    const entryId = crypto.randomUUID();
    const { type, description, amountInCents, status, occurredAt } = request;
    if (type === "revenue") {
      deal.installments.push({
        id: entryId,
        amountInCents,
        dueAt: occurredAt,
        paidAt: status === "confirmed" ? occurredAt : null,
        description,
        createdAt,
      });
    } else {
      mockStore.expenses[id] = [
        ...(mockStore.expenses[id] ?? []),
        { id: entryId, type, description, amountInCents, status, occurredAt, createdAt, projectName: null },
      ];
    }
    return respond(revenueOrExpenseEntry(id, entryId));
  },

  updateLedgerEntry(id: string, entryId: string, request: UpdateLedgerEntryRequest): Promise<void> {
    const deal = findDeal(id);
    const { description, amountInCents, status, occurredAt } = request;
    const installment = deal.installments.find((item) => item.id === entryId);
    if (installment) {
      Object.assign(installment, {
        amountInCents,
        description,
        dueAt: occurredAt,
        paidAt: status === "confirmed" ? occurredAt : null,
      });
    } else {
      const expenses = mockStore.expenses[id] ?? [];
      mockStore.expenses[id] = expenses.map((entry) =>
        entry.id === entryId ? { ...entry, description, amountInCents, status, occurredAt } : entry
      );
    }
    return respond(undefined);
  },

  deleteLedgerEntry(id: string, entryId: string): Promise<void> {
    const deal = findDeal(id);
    deal.installments = deal.installments.filter((item) => item.id !== entryId);
    mockStore.expenses[id] = (mockStore.expenses[id] ?? []).filter((entry) => entry.id !== entryId);
    return respond(undefined);
  },

  restoreLedgerEntry(id: string, entry: LedgerEntry): Promise<void> {
    const deal = findDeal(id);
    if (entry.type === "revenue") {
      deal.installments.push({
        id: entry.id,
        amountInCents: entry.amountInCents,
        dueAt: entry.occurredAt,
        paidAt: entry.status === "confirmed" ? entry.occurredAt : null,
        description: entry.description,
        createdAt: entry.createdAt,
      });
    } else {
      mockStore.expenses[id] = [...(mockStore.expenses[id] ?? []), entry];
    }
    return respond(undefined);
  },

  createCustomerProject(id: string, request: CreateCustomerProjectRequest): Promise<CustomerProject> {
    findDeal(id);
    const project: CustomerProject = {
      id: crypto.randomUUID(),
      ...request,
      deliveredAt: request.status === "delivered" ? new Date().toISOString() : null,
    };
    mockStore.projects.push({ ...project, leadId: id });
    return respond(project);
  },

  deleteCustomerProject(id: string, projectId: string): Promise<void> {
    mockStore.projects = mockStore.projects.filter(
      (project) => !(project.leadId === id && project.id === projectId)
    );
    return respond(undefined);
  },

  createCustomer({ document, closedValueInCents, firstInstallmentDueAt, ...contact }: CreateCustomerRequest): Promise<LeadSummary> {
    const created = addMockLead(contact, "won");
    mockCustomerDocuments[created.id] = document;
    openWonDeal(created.id, closedValueInCents, firstInstallmentDueAt);
    return respond(created);
  },

  updateCustomer(id: string, { document, ...contact }: UpdateCustomerRequest): Promise<void> {
    findLead(id);
    updateMockLead(id, contact);
    mockCustomerDocuments[id] = document;
    return respond(undefined);
  },

  deleteCustomer(id: string): Promise<void> {
    const deal = findDeal(id);
    const lead = findLead(id);
    mockStore.wonDeals.splice(mockStore.wonDeals.indexOf(deal), 1);
    mockStore.projects = mockStore.projects.filter((project) => project.leadId !== id);
    delete mockStore.expenses[id];
    mockStore.nextActions = mockStore.nextActions.filter((action) => action.lead.id !== id);
    mockStore.notes = mockStore.notes.filter((note) => note.leadId !== id);
    mockLeads.splice(mockLeads.indexOf(lead), 1);
    return respond(undefined);
  },
};
