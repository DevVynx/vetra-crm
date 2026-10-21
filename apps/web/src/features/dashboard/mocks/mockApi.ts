import type {
  CompleteNextActionRequest,
  CreateNextActionRequest,
  DashboardFunnelResponse,
  DashboardPeriodQuery,
  DashboardRevenueResponse,
  DashboardSummaryResponse,
  LeadStage,
  LeadSummary,
  ListAwaitingConversationsResponse,
  ListLeadsWithoutNextActionResponse,
  ListNextActionsResponse,
  NextAction,
  RescheduleNextActionRequest,
  RevenueGranularity,
} from "@vetra/contracts";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  min,
  startOfMonth,
} from "date-fns";

import { funnelStages } from "../constants/leadStages";
import { type DateRange, isWithin, periodRanges } from "../utils/periodRanges";
import {
  buildMockAwaitingConversations,
  buildMockNextActions,
  buildMockWonDeals,
  mockLeads,
} from "./fixtures";

// In-memory stand-in for apps/api while the backend doesn't exist. Each function mirrors
// a future endpoint, so replacing it with an axios call is the only change the hooks need.

const MOCK_LATENCY_IN_MS = 250;

const negotiatingStages = new Set<LeadStage>(["conversing", "meeting", "proposal_sent"]);

let nextActions = buildMockNextActions();
const wonDeals = buildMockWonDeals();
const awaitingConversations = buildMockAwaitingConversations();

const respond = <T>(data: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(data)), MOCK_LATENCY_IN_MS));

const sumBy = <T>(items: T[], amountOf: (item: T) => number) =>
  items.reduce((total, item) => total + amountOf(item), 0);

const changeRatio = (current: number, previous: number) =>
  previous === 0 ? null : (current - previous) / previous;

const installments = () => wonDeals.flatMap((deal) => deal.installments);
const paymentsIn = (range: DateRange | null) =>
  installments().filter((item) => item.paidAt !== null && isWithin(item.paidAt, range));
const salesIn = (range: DateRange | null) =>
  wonDeals.filter((deal) => isWithin(deal.closedAt, range));
const receivedIn = (range: DateRange | null) =>
  sumBy(paymentsIn(range), (item) => item.amountInCents);
const soldIn = (range: DateRange | null) =>
  sumBy(salesIn(range), (deal) => deal.closedValueInCents);

const isActive = (lead: LeadSummary) => lead.stage !== "won" && lead.stage !== "lost";

const findNextAction = (id: string): NextAction => {
  const found = nextActions.find((item) => item.id === id);
  if (!found) throw new Error(`Next action ${id} not found`);
  return found;
};

export const dashboardMockApi = {
  getSummary({ period }: DashboardPeriodQuery): Promise<DashboardSummaryResponse> {
    const { current, previous } = periodRanges(period);
    const pendingInstallments = installments().filter((item) => item.paidAt === null);
    const recurringDeals = wonDeals.filter((deal) => deal.monthlyFeeInCents !== null);
    const negotiatingLeads = mockLeads.filter((lead) => negotiatingStages.has(lead.stage));

    return respond({
      received: {
        amountInCents: receivedIn(current),
        paymentsCount: paymentsIn(current).length,
        changeRatio: previous && changeRatio(receivedIn(current), receivedIn(previous)),
      },
      sold: {
        amountInCents: soldIn(current),
        clientsCount: salesIn(current).length,
        changeRatio: previous && changeRatio(soldIn(current), soldIn(previous)),
      },
      receivable: {
        amountInCents: sumBy(pendingInstallments, (item) => item.amountInCents),
        pendingInstallmentsCount: pendingInstallments.length,
      },
      recurring: {
        monthlyAmountInCents: sumBy(recurringDeals, (deal) => deal.monthlyFeeInCents ?? 0),
        clientsCount: recurringDeals.length,
      },
      activeProjectsCount: wonDeals.filter((deal) => deal.projectStatus === "in_production").length,
      negotiating: {
        leadsCount: negotiatingLeads.length,
        proposalsCount: negotiatingLeads.filter((lead) => lead.stage === "proposal_sent").length,
      },
    });
  },

  getRevenue({ period }: DashboardPeriodQuery): Promise<DashboardRevenueResponse> {
    const now = new Date();
    const firstSaleAt = min(wonDeals.map((deal) => new Date(deal.closedAt)));
    const start = periodRanges(period).current?.start ?? startOfMonth(firstSaleAt);
    const granularity: RevenueGranularity =
      period === "week" || period === "month" ? "day" : "month";
    const buckets =
      granularity === "day"
        ? eachDayOfInterval({ start, end: now })
        : eachMonthOfInterval({ start, end: now });
    const bucketEnd = granularity === "day" ? endOfDay : endOfMonth;

    return respond({
      granularity,
      points: buckets.map((bucketStart) => {
        const upToBucket = { start, end: min([bucketEnd(bucketStart), now]) };
        return {
          bucketStart: bucketStart.toISOString(),
          receivedInCents: receivedIn(upToBucket),
          soldInCents: soldIn(upToBucket),
        };
      }),
    });
  },

  getFunnel(): Promise<DashboardFunnelResponse> {
    return respond({
      // Without stage history, "reached" is approximated by the current stage; lost and
      // no-response leads are left out because their last stage is unknown.
      funnel: funnelStages.map((stage, index) => ({
        stage,
        reachedCount: mockLeads.filter((lead) => funnelStages.indexOf(lead.stage) >= index).length,
      })),
    });
  },

  listNextActions(): Promise<ListNextActionsResponse> {
    return respond({ nextActions });
  },

  listAwaitingConversations(): Promise<ListAwaitingConversationsResponse> {
    return respond({ conversations: awaitingConversations });
  },

  listLeadsWithoutNextAction(): Promise<ListLeadsWithoutNextActionResponse> {
    const leadIdsWithAction = new Set(nextActions.map((item) => item.lead.id));
    return respond({
      leads: mockLeads.filter((lead) => isActive(lead) && !leadIdsWithAction.has(lead.id)),
    });
  },

  completeNextAction(id: string, { next }: CompleteNextActionRequest): Promise<void> {
    const completed = findNextAction(id);
    nextActions = [
      ...nextActions.filter((item) => item.id !== id),
      { ...next, id: crypto.randomUUID(), lead: completed.lead },
    ];
    return respond(undefined);
  },

  rescheduleNextAction(id: string, { dueAt }: RescheduleNextActionRequest): Promise<void> {
    findNextAction(id);
    nextActions = nextActions.map((item) => (item.id === id ? { ...item, dueAt } : item));
    return respond(undefined);
  },

  createNextAction({ leadId, ...input }: CreateNextActionRequest): Promise<void> {
    const lead = mockLeads.find((item) => item.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);
    nextActions = [...nextActions, { ...input, id: crypto.randomUUID(), lead }];
    return respond(undefined);
  },
};
