import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const dashboardSummaryQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.summary(period),
    queryFn: () => dashboardMockApi.getSummary({ period }),
    placeholderData: keepPreviousData,
  });

export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery(dashboardSummaryQueryOptions(period));
}
