import { useQuery } from "@tanstack/react-query";
import type { ListLeadIdsQuery, ListLeadIdsResponse } from "@vetra/contracts";
import { leadsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

// Disabled because it only runs on demand, when "select all" is clicked, through refetch().
export function useLeadIds(query: ListLeadIdsQuery) {
  return useQuery({
    queryKey: leadsQueryKeys.ids(query),
    queryFn: async () =>
      (
        await api.get<ListLeadIdsResponse>(leadsRoutes.ids, {
          params: { ...query, filters: JSON.stringify(query.filters) },
        })
      ).data,
    enabled: false,
  });
}
