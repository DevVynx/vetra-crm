import { queryOptions, useQuery } from "@tanstack/react-query";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadNextActionsQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.nextActions(leadId),
    queryFn: () => leadsMockApi.listLeadNextActions(leadId),
  });

export function useLeadNextActions(leadId: string) {
  return useQuery(leadNextActionsQueryOptions(leadId));
}
