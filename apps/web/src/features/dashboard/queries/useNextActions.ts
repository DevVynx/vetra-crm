import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListNextActionsResponse } from "@vetra/contracts";
import { dashboardRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { dashboardQueryKeys } from "./keys";

export const nextActionsQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.nextActions,
  queryFn: async () => (await api.get<ListNextActionsResponse>(dashboardRoutes.nextActions)).data,
});

export function useNextActions() {
  return useQuery(nextActionsQueryOptions);
}
