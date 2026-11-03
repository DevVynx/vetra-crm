import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { DashboardPeriod, DashboardProspectingResponse } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const dashboardProspectingQueryOptions = (period: DashboardPeriod) =>
  queryOptions({
    queryKey: dashboardQueryKeys.prospecting(period),
    queryFn: async () =>
      (
        await api.get<DashboardProspectingResponse>(dashboardRoutes.prospecting, {
          params: { period },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export function useDashboardProspecting(period: DashboardPeriod) {
  return useQuery(dashboardProspectingQueryOptions(period));
}
