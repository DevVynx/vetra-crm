import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetAutomationLeadsResponse } from "@vetra/contracts";
import { automationsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { automationsQueryKeys } from "@/shared/queries/automations/useAutomationSettings";

// What turning the sending on or off for every lead at once would reach. Always read again: it changes
// with every lead and activity.
export const automationLeadsQueryOptions = queryOptions({
  queryKey: [...automationsQueryKeys.all, "leads"] as const,
  queryFn: async () => (await api.get<GetAutomationLeadsResponse>(automationsRoutes.leads)).data,
  staleTime: 0,
  refetchOnMount: "always",
});

export function useAutomationLeads() {
  return useQuery(automationLeadsQueryOptions);
}
