import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const dashboardProspectingQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.prospecting(period),
    queryFn: () => dashboardMockApi.getProspecting({ period }),
    placeholderData: keepPreviousData,
  });

export function useDashboardProspecting(period: DashboardPeriod) {
  return useQuery(dashboardProspectingQueryOptions(period));
}
