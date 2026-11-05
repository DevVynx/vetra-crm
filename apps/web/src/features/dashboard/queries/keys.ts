import type { DashboardPeriod } from "@vetra/contracts";

import { nextActionsQueryKeys } from "@/shared/queries/next-actions/keys";

export const dashboardQueryKeys = {
  summary: (period: DashboardPeriod) => ["dashboard", "summary", period] as const,
  revenue: (period: DashboardPeriod) => ["dashboard", "revenue", period] as const,
  funnel: (period: DashboardPeriod) => ["dashboard", "funnel", period] as const,
  prospecting: (period: DashboardPeriod) => ["dashboard", "prospecting", period] as const,
  conversionByNiche: (period: DashboardPeriod) =>
    ["dashboard", "conversion-by-niche", period] as const,
  nextActions: nextActionsQueryKeys.all,
  leadsWithoutNextAction: nextActionsQueryKeys.leadsWithoutNextAction,
};
