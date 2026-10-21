import { queryOptions, useQuery } from "@tanstack/react-query";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const dashboardFunnelQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.funnel,
  queryFn: () => dashboardMockApi.getFunnel(),
});

export function useDashboardFunnel() {
  return useQuery(dashboardFunnelQueryOptions);
}
