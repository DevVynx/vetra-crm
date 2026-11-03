import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardConversionByNicheResponse, DashboardPeriod } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const conversionByNicheQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.conversionByNiche(period),
    queryFn: async () =>
      (
        await api.get<DashboardConversionByNicheResponse>(dashboardRoutes.conversionByNiche, {
          params: { period },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export function useConversionByNiche(period: DashboardPeriod) {
  return useQuery(conversionByNicheQueryOptions(period));
}
