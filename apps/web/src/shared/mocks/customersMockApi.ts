import type {
  CreateCustomerProjectRequest,
  CreateCustomerProjectResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  CreateLedgerEntryRequest,
  CreateLedgerEntryResponse,
  CustomerListItem,
  CustomerProject,
  DeleteCustomerProjectResponse,
  DeleteCustomerResponse,
  DeleteLedgerEntryResponse,
  FilterOptionsQuery,
  FilterOptionsResponse,
  GetCustomerResponse,
  LedgerEntry,
  ListCustomerProjectsResponse,
  ListCustomersQuery,
  ListCustomersResponse,
  ListLedgerEntriesQuery,
  ListLedgerEntriesResponse,
  UpdateCustomerProjectRequest,
  UpdateCustomerProjectResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
  UpdateLedgerEntryRequest,
  UpdateLedgerEntryResponse,
  WonDeal,
} from "@vetra/contracts";
import { NO_PROJECT_FILTER_VALUE } from "@vetra/contracts";

import { normalizeText } from "@/shared/utils/text";

import { distinctOptions, type FilterAccessors, matchesFilters } from "./filterEngine";
import {
  addMockLead,
  leadContactFor,
  mockCustomerDocuments,
  mockLeads,
  type MockProject,
  updateMockLead,
} from "./fixtures";
import { closingStageId } from "./stageRules";
import { mockStore, openWonDeal, paginate, respond, sumBy } from "./store";

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
// The closed value counts as billed even while part of it has no installments yet.
const billedOf = (deal: WonDeal) => Math.max(deal.closedValueInCents, totalOf(deal));
const receivedOf = (deal: WonDeal) =>
  sumBy(
    deal.installments.filter((item) => item.paidAt !== null),
    (item) => item.amountInCents
  );

const projectNameOf = (leadId: string, projectId: string | null | undefined) =>
  projectsOf(leadId).find((project) => project.id === projectId)?.name ?? null;

const revenueEntriesOf = (deal: WonDeal): LedgerEntry[] =>
  deal.installments.map((item, index) => ({
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
    projectId: item.projectId ?? null,
    projectName: projectNameOf(deal.leadId, item.projectId),
  }));

const ledgerEntriesOf = (id: string): LedgerEntry[] =>
  [...revenueEntriesOf(findDeal(id)), ...(mockStore.expenses[id] ?? [])].map((entry) => ({
    ...entry,
    projectName: projectNameOf(id, entry.projectId),
  }));

const revenueOrExpenseEntry = (id: string, entryId: string): LedgerEntry => {
  const entry = ledgerEntriesOf(id).find((item) => item.id === entryId);
  if (!entry) throw new Error(`Entry ${entryId} not found`);
  return entry;
};

const ledgerFilterAccessors: FilterAccessors<LedgerEntry> = {
  type: (entry) => entry.type,
  status: (entry) => entry.status,
  project: (entry) => entry.projectId ?? NO_PROJECT_FILTER_VALUE,
  amount: (entry) => entry.amountInCents,
  date: (entry) => entry.occurredAt,
};

const projectSummaryOf = (leadId: string, project: MockProject): CustomerProject => {
  const linked = ledgerEntriesOf(leadId).filter((entry) => entry.projectId === project.id);
  const sumOf = (type: LedgerEntry["type"], status: LedgerEntry["status"]) =>
    sumBy(
      linked.filter((entry) => entry.type === type && entry.status === status),
      (entry) => entry.amountInCents
    );
  const { leadId: _leadId, ...rest } = project;

  return {
    ...rest,
    financial: {
      receivedInCents: sumOf("revenue", "confirmed"),
      pendingInCents: sumOf("revenue", "pending"),
      expensesInCents: sumOf("expense", "confirmed"),
      linkedEntriesCount: linked.length,
    },
  };
};

const customerFilterAccessors: FilterAccessors<CustomerListItem> = {
  niche: (customer) => customer.niche,
  city: (customer) => customer.city,
  closed_value: (customer) => customer.closedValueInCents,
  monthly_fee: (customer) => customer.monthlyFeeInCents !== null,
  active_project: (customer) => customer.activeProjectsCount > 0,
  closed_at: (customer) => customer.closedAt,
};

export const customersMockApi = {
  listCustomers({
    q,
    filters,
    page,
    pageSize,
  }: ListCustomersQuery): Promise<ListCustomersResponse> {
    const search = normalizeText(q);
    const items = mockStore.wonDeals
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
      .filter((customer) => matchesFilters(customer, filters, customerFilterAccessors))
      .filter((customer) =>
        [customer.businessName, customer.contactName ?? "", customer.niche, customer.city].some(
          (field) => normalizeText(field).includes(search)
        )
      )
      .sort((a, b) => b.closedAt.localeCompare(a.closedAt));

    return respond(paginate(items, page, pageSize));
  },

  getCustomerFilterOptions({ field }: FilterOptionsQuery): Promise<FilterOptionsResponse> {
    return respond({
      items: distinctOptions(mockStore.wonDeals.map((deal) => findLead(deal.leadId)[field])),
    });
  },

  getCustomer(id: string): Promise<GetCustomerResponse> {
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
        totalInCents: billedOf(deal),
        monthlyFeeInCents: deal.monthlyFeeInCents,
      },
      projectMetrics: {
        total: projects.length,
        active: projects.filter((project) => project.status === "in_production").length,
        completed: projects.filter((project) => project.status === "delivered").length,
      },
      financial: {
        confirmedRevenueInCents: confirmedRevenue,
        pendingRevenueInCents: billedOf(deal) - confirmedRevenue,
        confirmedExpenseInCents: confirmedExpense,
        pendingExpenseInCents: sumExpenses("pending"),
        balanceInCents: confirmedRevenue - confirmedExpense,
      },
    });
  },

  listCustomerLedger(
    id: string,
    { filters }: ListLedgerEntriesQuery
  ): Promise<ListLedgerEntriesResponse> {
    const entries = ledgerEntriesOf(id)
      .filter((entry) => matchesFilters(entry, filters, ledgerFilterAccessors))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return respond({ entries });
  },

  listCustomerProjects(id: string): Promise<ListCustomerProjectsResponse> {
    findDeal(id);
    const projects = projectsOf(id)
      .map((project) => projectSummaryOf(id, project))
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "in_production" ? -1 : 1;
        return b.startedAt.localeCompare(a.startedAt);
      });
    return respond({ projects });
  },

  createLedgerEntry(
    id: string,
    request: CreateLedgerEntryRequest
  ): Promise<CreateLedgerEntryResponse> {
    const deal = findDeal(id);
    const createdAt = new Date().toISOString();
    const entryId = crypto.randomUUID();
    const { type, description, amountInCents, status, occurredAt, projectId } = request;
    if (type === "revenue") {
      deal.installments.push({
        id: entryId,
        amountInCents,
        dueAt: occurredAt,
        paidAt: status === "confirmed" ? occurredAt : null,
        projectId,
        description,
        createdAt,
      });
    } else {
      mockStore.expenses[id] = [
        ...(mockStore.expenses[id] ?? []),
        {
          id: entryId,
          type,
          description,
          amountInCents,
          status,
          occurredAt,
          createdAt,
          projectId,
          projectName: null,
        },
      ];
    }
    return respond(revenueOrExpenseEntry(id, entryId));
  },

  updateLedgerEntry(
    id: string,
    entryId: string,
    request: UpdateLedgerEntryRequest
  ): Promise<UpdateLedgerEntryResponse> {
    const deal = findDeal(id);
    const { description, amountInCents, status, occurredAt, projectId } = request;
    const installment = deal.installments.find((item) => item.id === entryId);
    if (installment) {
      Object.assign(installment, {
        amountInCents,
        description,
        dueAt: occurredAt,
        paidAt: status === "confirmed" ? occurredAt : null,
        projectId,
      });
    } else {
      const expenses = mockStore.expenses[id] ?? [];
      mockStore.expenses[id] = expenses.map((entry) =>
        entry.id === entryId
          ? { ...entry, description, amountInCents, status, occurredAt, projectId }
          : entry
      );
    }
    return respond(revenueOrExpenseEntry(id, entryId));
  },

  deleteLedgerEntry(id: string, entryId: string): Promise<DeleteLedgerEntryResponse> {
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
        projectId: entry.projectId,
        description: entry.description,
        createdAt: entry.createdAt,
      });
    } else {
      mockStore.expenses[id] = [...(mockStore.expenses[id] ?? []), entry];
    }
    return respond(undefined);
  },

  createCustomerProject(
    id: string,
    request: CreateCustomerProjectRequest
  ): Promise<CreateCustomerProjectResponse> {
    findDeal(id);
    const project: MockProject = {
      id: crypto.randomUUID(),
      leadId: id,
      ...request,
      deliveredAt: request.status === "delivered" ? new Date().toISOString() : null,
    };
    mockStore.projects.push(project);
    return respond(projectSummaryOf(id, project));
  },

  updateCustomerProject(
    id: string,
    projectId: string,
    request: UpdateCustomerProjectRequest
  ): Promise<UpdateCustomerProjectResponse> {
    findDeal(id);
    const project = projectsOf(id).find((item) => item.id === projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const deliveredAt =
      request.status === "delivered" ? (project.deliveredAt ?? new Date().toISOString()) : null;
    Object.assign(project, request, { deliveredAt });
    return respond(projectSummaryOf(id, project));
  },

  deleteCustomerProject(id: string, projectId: string): Promise<DeleteCustomerProjectResponse> {
    const deal = findDeal(id);
    mockStore.projects = mockStore.projects.filter(
      (project) => !(project.leadId === id && project.id === projectId)
    );
    for (const installment of deal.installments) {
      if (installment.projectId === projectId) installment.projectId = null;
    }
    mockStore.expenses[id] = (mockStore.expenses[id] ?? []).map((entry) =>
      entry.projectId === projectId ? { ...entry, projectId: null } : entry
    );
    return respond(undefined);
  },

  createCustomer({
    document,
    closedValueInCents,
    receivedInCents,
    installmentsCount,
    firstInstallmentDueAt,
    ...contact
  }: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    const created = addMockLead(contact, closingStageId());
    mockCustomerDocuments[created.id] = document;
    openWonDeal(created.id, {
      closedValueInCents,
      receivedInCents,
      installmentsCount,
      firstInstallmentDueAt,
    });
    return respond(created);
  },

  updateCustomer(
    id: string,
    { document, ...contact }: UpdateCustomerRequest
  ): Promise<UpdateCustomerResponse> {
    findLead(id);
    const updated = updateMockLead(id, contact);
    mockCustomerDocuments[id] = document;
    return respond(updated);
  },

  deleteCustomer(id: string): Promise<DeleteCustomerResponse> {
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
