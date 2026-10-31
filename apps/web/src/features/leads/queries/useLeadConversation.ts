import { queryOptions, useQuery } from "@tanstack/react-query";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadConversationQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.conversation(leadId),
    queryFn: () => leadsMockApi.getLeadConversation(leadId),
  });

export function useLeadConversation(leadId: string) {
  return useQuery(leadConversationQueryOptions(leadId));
}
