import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListLeadsWithoutNextActionResponse } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const leadsWithoutNextActionQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.leadsWithoutNextAction,
  queryFn: async () =>
    (await api.get<ListLeadsWithoutNextActionResponse>(dashboardRoutes.leadsWithoutNextAction))
      .data,
});

export function useLeadsWithoutNextAction() {
  return useQuery(leadsWithoutNextActionQueryOptions);
}
