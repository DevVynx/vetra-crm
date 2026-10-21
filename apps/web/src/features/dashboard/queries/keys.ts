import type { DashboardPeriod } from "@vetra/contracts";

export const dashboardQueryKeys = {
  summary: (period: DashboardPeriod) => ["dashboard", "summary", period] as const,
  revenue: (period: DashboardPeriod) => ["dashboard", "revenue", period] as const,
  funnel: ["dashboard", "funnel"] as const,
  nextActions: ["next-actions"] as const,
  awaitingConversations: ["conversations", "awaiting"] as const,
  leadsWithoutNextAction: ["leads", "without-next-action"] as const,
};
