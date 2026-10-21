import type { DashboardPeriod } from "@vetra/contracts";

export const dashboardQueryKeys = {
  summary: (period: DashboardPeriod) => ["dashboard", "summary", period] as const,
  revenue: (period: DashboardPeriod) => ["dashboard", "revenue", period] as const,
  funnel: (period: DashboardPeriod) => ["dashboard", "funnel", period] as const,
  prospecting: (period: DashboardPeriod) => ["dashboard", "prospecting", period] as const,
  conversionByNiche: (period: DashboardPeriod) =>
    ["dashboard", "conversion-by-niche", period] as const,
  nextActions: ["next-actions"] as const,
  awaitingConversations: ["conversations", "awaiting"] as const,
  leadsWithoutNextAction: ["leads", "without-next-action"] as const,
};
