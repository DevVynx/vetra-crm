import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const dashboardFunnelQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.funnel(period),
    queryFn: () => dashboardMockApi.getFunnel({ period }),
    placeholderData: keepPreviousData,
  });

export function useDashboardFunnel(period: DashboardPeriod) {
  return useQuery(dashboardFunnelQueryOptions(period));
}
