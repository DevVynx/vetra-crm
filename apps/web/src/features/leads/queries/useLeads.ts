import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { ListLeadsQuery, ListLeadsResponse } from "@vetra/contracts";
import { leadsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadsQueryOptions = (query: ListLeadsQuery) =>
  queryOptions({
    queryKey: leadsQueryKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ListLeadsResponse>(leadsRoutes.base, {
          params: { ...query, filters: JSON.stringify(query.filters) },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export function useLeads(query: ListLeadsQuery, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...leadsQueryOptions(query), enabled });
}
