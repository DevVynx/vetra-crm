import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardFunnelResponse, DashboardPeriod } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const dashboardFunnelQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.funnel(period),
    queryFn: async () =>
      (await api.get<DashboardFunnelResponse>(dashboardRoutes.funnel, { params: { period } })).data,
    placeholderData: keepPreviousData,
  });

export function useDashboardFunnel(period: DashboardPeriod) {
  return useQuery(dashboardFunnelQueryOptions(period));
}
