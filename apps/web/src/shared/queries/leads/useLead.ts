import { queryOptions, useQuery } from "@tanstack/react-query";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.detail(leadId),
    queryFn: () => leadsMockApi.getLead(leadId),
    // A missing lead will not appear by retrying.
    retry: false,
  });

export function useLead(leadId: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...leadQueryOptions(leadId), enabled });
}
