import { queryOptions, useQuery } from "@tanstack/react-query";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const nextActionsQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.nextActions,
  queryFn: () => dashboardMockApi.listNextActions(),
});

export function useNextActions() {
  return useQuery(nextActionsQueryOptions);
}
