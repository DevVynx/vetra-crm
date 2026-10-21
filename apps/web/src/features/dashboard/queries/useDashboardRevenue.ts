import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const dashboardRevenueQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.revenue(period),
    queryFn: () => dashboardMockApi.getRevenue({ period }),
    placeholderData: keepPreviousData,
  });

export function useDashboardRevenue(period: DashboardPeriod) {
  return useQuery(dashboardRevenueQueryOptions(period));
}
