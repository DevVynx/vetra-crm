import type {
  CompleteNextActionRequest,
  CreateNextActionRequest,
  DashboardConversionByNicheResponse,
  DashboardFunnelResponse,
  DashboardPeriod,
  DashboardPeriodQuery,
  DashboardProspectingResponse,
  DashboardRevenueResponse,
  DashboardSummaryResponse,
  LeadStage,
  LeadSummary,
  ListAwaitingConversationsResponse,
  ListLeadsWithoutNextActionResponse,
  ListNextActionsResponse,
  NextAction,
  NicheConversion,
  ProspectingGranularity,
  RescheduleNextActionRequest,
  RevenueGranularity,
} from "@vetra/contracts";
import {
  differenceInMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  max,
  min,
  startOfMonth,
  startOfYear,
} from "date-fns";

import { type DateRange, isWithin, periodRanges } from "@/features/dashboard/utils/periodRanges";
import { funnelStages } from "@/shared/constants/leadStages";

import { mockLeads } from "./fixtures";
import { mockStore, respond, sumBy } from "./store";


const TOP_NICHES = 11;
const MAX_MONTHLY_SPAN_IN_MONTHS = 24;

const negotiatingStages = new Set<LeadStage>(["conversing", "meeting", "proposal_sent"]);

const { wonDeals, awaitingConversations } = mockStore;

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

const hasLongHistory = (period: DashboardPeriod, firstDate: Date) =>
  period === "all_time" && differenceInMonths(new Date(), firstDate) > MAX_MONTHLY_SPAN_IN_MONTHS;

const revenueGranularityFor = (period: DashboardPeriod, firstSaleAt: Date): RevenueGranularity => {
  if (period === "week" || period === "month") return "day";
  return hasLongHistory(period, firstSaleAt) ? "year" : "month";
};

const prospectingGranularityFor = (
  period: DashboardPeriod,
  firstProspectedAt: Date
): ProspectingGranularity => {
  if (period === "week") return "day";
  if (period === "month") return "week";
  return hasLongHistory(period, firstProspectedAt) ? "year" : "month";
};

const allTimeStart = (granularity: RevenueGranularity | ProspectingGranularity, first: Date) =>
  granularity === "year" ? startOfYear(first) : startOfMonth(first);

const isActive = (lead: LeadSummary) => lead.stage !== "won" && lead.stage !== "lost";

const findNextAction = (id: string): NextAction => {
  const found = mockStore.nextActions.find((item) => item.id === id);
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
        customersCount: salesIn(current).length,
        changeRatio: previous && changeRatio(soldIn(current), soldIn(previous)),
      },
      receivable: {
        amountInCents: sumBy(pendingInstallments, (item) => item.amountInCents),
        pendingInstallmentsCount: pendingInstallments.length,
      },
      recurring: {
        monthlyAmountInCents: sumBy(recurringDeals, (deal) => deal.monthlyFeeInCents ?? 0),
        customersCount: recurringDeals.length,
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
    const granularity = revenueGranularityFor(period, firstSaleAt);
    const start = periodRanges(period).current?.start ?? allTimeStart(granularity, firstSaleAt);
    const buckets = {
      day: () => eachDayOfInterval({ start, end: now }),
      month: () => eachMonthOfInterval({ start, end: now }),
      year: () => eachYearOfInterval({ start, end: now }),
    }[granularity]();
    const bucketEnd = { day: endOfDay, month: endOfMonth, year: endOfYear }[granularity];

    return respond({
      granularity,
      points: buckets.map((rawBucketStart) => {
        const bucketStart = max([rawBucketStart, start]);
        const upToBucket = { start, end: min([bucketEnd(bucketStart), now]) };
        return {
          bucketStart: bucketStart.toISOString(),
          receivedInCents: receivedIn(upToBucket),
          soldInCents: soldIn(upToBucket),
        };
      }),
    });
  },

  getFunnel({ period }: DashboardPeriodQuery): Promise<DashboardFunnelResponse> {
    const { current } = periodRanges(period);
    const cohort = mockLeads.filter((lead) => isWithin(lead.prospectedAt, current));

    return respond({
      // Without stage history, "reached" is approximated by the current stage; lost and
      // no-response leads are left out because their last stage is unknown.
      funnel: funnelStages.map((stage, index) => ({
        stage,
        reachedCount: cohort.filter((lead) => funnelStages.indexOf(lead.stoppedAtStage ?? lead.stage) >= index).length,
      })),
    });
  },

  getProspecting({ period }: DashboardPeriodQuery): Promise<DashboardProspectingResponse> {
    const now = new Date();
    const firstProspectedAt = min(mockLeads.map((lead) => new Date(lead.prospectedAt)));
    const granularity = prospectingGranularityFor(period, firstProspectedAt);
    const start =
      periodRanges(period).current?.start ?? allTimeStart(granularity, firstProspectedAt);
    const buckets = {
      day: () => eachDayOfInterval({ start, end: now }),
      week: () => eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 }),
      month: () => eachMonthOfInterval({ start, end: now }),
      year: () => eachYearOfInterval({ start, end: now }),
    }[granularity]();
    const bucketEnd = {
      day: endOfDay,
      week: (date: Date) => endOfWeek(date, { weekStartsOn: 1 }),
      month: endOfMonth,
      year: endOfYear,
    }[granularity];

    return respond({
      granularity,
      points: buckets.map((rawBucketStart) => {
        const bucketStart = max([rawBucketStart, start]);
        const cohort = mockLeads.filter((lead) =>
          isWithin(lead.prospectedAt, {
            start: bucketStart,
            end: min([bucketEnd(rawBucketStart), now]),
          })
        );
        return {
          bucketStart: bucketStart.toISOString(),
          prospectedCount: cohort.length,
          wonCount: cohort.filter((lead) => lead.stage === "won").length,
        };
      }),
    });
  },

  getConversionByNiche({
    period,
  }: DashboardPeriodQuery): Promise<DashboardConversionByNicheResponse> {
    const { current } = periodRanges(period);
    const byNiche = new Map<string, NicheConversion>();

    for (const lead of mockLeads.filter((item) => isWithin(item.prospectedAt, current))) {
      const entry = byNiche.get(lead.niche) ?? {
        niche: lead.niche,
        prospectedCount: 0,
        wonCount: 0,
      };
      byNiche.set(lead.niche, {
        ...entry,
        prospectedCount: entry.prospectedCount + 1,
        wonCount: entry.wonCount + (lead.stage === "won" ? 1 : 0),
      });
    }

    const conversionOf = (item: NicheConversion) => item.wonCount / item.prospectedCount;
    const ranked = [...byNiche.values()].sort(
      (a, b) => conversionOf(b) - conversionOf(a) || b.prospectedCount - a.prospectedCount
    );
    const rest = ranked.slice(TOP_NICHES);

    return respond({
      niches: ranked.slice(0, TOP_NICHES),
      others:
        rest.length === 0
          ? null
          : {
              prospectedCount: sumBy(rest, (item) => item.prospectedCount),
              wonCount: sumBy(rest, (item) => item.wonCount),
            },
    });
  },

  listNextActions(): Promise<ListNextActionsResponse> {
    return respond({ nextActions: mockStore.nextActions });
  },

  listAwaitingConversations(): Promise<ListAwaitingConversationsResponse> {
    return respond({ conversations: awaitingConversations });
  },

  listLeadsWithoutNextAction(): Promise<ListLeadsWithoutNextActionResponse> {
    const leadIdsWithAction = new Set(mockStore.nextActions.map((item) => item.lead.id));
    return respond({
      leads: mockLeads.filter((lead) => isActive(lead) && !leadIdsWithAction.has(lead.id)),
    });
  },

  completeNextAction(id: string, { next }: CompleteNextActionRequest): Promise<void> {
    const completed = findNextAction(id);
    mockStore.nextActions = [
      ...mockStore.nextActions.filter((item) => item.id !== id),
      { ...next, id: crypto.randomUUID(), lead: completed.lead },
    ];
    return respond(undefined);
  },

  rescheduleNextAction(id: string, { dueAt }: RescheduleNextActionRequest): Promise<void> {
    findNextAction(id);
    mockStore.nextActions = mockStore.nextActions.map((item) => (item.id === id ? { ...item, dueAt } : item));
    return respond(undefined);
  },

  createNextAction({ leadId, ...input }: CreateNextActionRequest): Promise<void> {
    const lead = mockLeads.find((item) => item.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);
    mockStore.nextActions = [...mockStore.nextActions, { ...input, id: crypto.randomUUID(), lead }];
    return respond(undefined);
  },
};
