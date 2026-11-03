import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetLeadConversationResponse } from "@vetra/contracts";

import { leadsQueryKeys } from "@/shared/queries/leads/keys";

// WhatsApp is not connected yet (no API route): every lead answers "no conversation".
const NOT_CONNECTED: GetLeadConversationResponse = { conversation: null };

export const leadConversationQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.conversation(leadId),
    queryFn: () => NOT_CONNECTED,
  });

export function useLeadConversation(leadId: string) {
  return useQuery(leadConversationQueryOptions(leadId));
}
