import { useQuery } from "@tanstack/react-query";
import type { FilterOptionsQuery, FilterOptionsResponse } from "@vetra/contracts";
import { leadsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export function useLeadFilterOptions(field: FilterOptionsQuery["field"]) {
  return useQuery({
    queryKey: leadsQueryKeys.filterOptions(field),
    queryFn: async () =>
      (await api.get<FilterOptionsResponse>(leadsRoutes.filterOptions, { params: { field } })).data,
  });
}
