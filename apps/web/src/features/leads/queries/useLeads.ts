import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { ListLeadsQuery } from "@vetra/contracts";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadsQueryOptions = (query: ListLeadsQuery) =>
  queryOptions({
    queryKey: leadsQueryKeys.list(query),
    queryFn: () => leadsMockApi.listLeads(query),
    placeholderData: keepPreviousData,
  });

export function useLeads(query: ListLeadsQuery, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...leadsQueryOptions(query), enabled });
}
