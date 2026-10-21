import { queryOptions, useQuery } from "@tanstack/react-query";

import { dashboardMockApi } from "../mocks/mockApi";
import { dashboardQueryKeys } from "./keys";

export const awaitingConversationsQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.awaitingConversations,
  queryFn: () => dashboardMockApi.listAwaitingConversations(),
});

export function useAwaitingConversations() {
  return useQuery(awaitingConversationsQueryOptions);
}
