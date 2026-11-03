import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod, DashboardRevenueResponse } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const dashboardRevenueQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.revenue(period),
    queryFn: async () =>
      (await api.get<DashboardRevenueResponse>(dashboardRoutes.revenue, { params: { period } }))
        .data,
    placeholderData: keepPreviousData,
  });

export function useDashboardRevenue(period: DashboardPeriod) {
  return useQuery(dashboardRevenueQueryOptions(period));
}
