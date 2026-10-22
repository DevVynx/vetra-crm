import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod } from "@vetra/contracts";

import { dashboardMockApi } from "@/shared/mocks/mockApi";

import { dashboardQueryKeys } from "./keys";

export const conversionByNicheQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.conversionByNiche(period),
    queryFn: () => dashboardMockApi.getConversionByNiche({ period }),
    placeholderData: keepPreviousData,
  });

export function useConversionByNiche(period: DashboardPeriod) {
  return useQuery(conversionByNicheQueryOptions(period));
}
