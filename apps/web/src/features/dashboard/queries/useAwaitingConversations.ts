import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListAwaitingConversationsResponse } from "@vetra/contracts";

import { dashboardQueryKeys } from "./keys";

// WhatsApp is not connected yet (no API route): nothing is awaiting a reply.
const NOT_CONNECTED: ListAwaitingConversationsResponse = { conversations: [] };

export const awaitingConversationsQueryOptions = queryOptions({
  queryKey: dashboardQueryKeys.awaitingConversations,
  queryFn: () => NOT_CONNECTED,
});

export function useAwaitingConversations() {
  return useQuery(awaitingConversationsQueryOptions);
}
