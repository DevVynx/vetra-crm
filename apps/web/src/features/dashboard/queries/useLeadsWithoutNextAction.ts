import { queryOptions, useQuery } from "@tanstack/react-query";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const leadsWithoutNextActionQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.leadsWithoutNextAction,
  queryFn: () => dashboardMockApi.listLeadsWithoutNextAction(),
});

export function useLeadsWithoutNextAction() {
  return useQuery(leadsWithoutNextActionQueryOptions);
}
