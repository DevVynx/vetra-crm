import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod, DashboardSummaryResponse } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const dashboardSummaryQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.summary(period),
    queryFn: async () =>
      (await api.get<DashboardSummaryResponse>(dashboardRoutes.summary, { params: { period } }))
        .data,
    placeholderData: keepPreviousData,
  });

export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery(dashboardSummaryQueryOptions(period));
}
