import { useQuery } from "@tanstack/react-query";
import type { FilterOptionsQuery } from "@vetra/contracts";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export function useLeadFilterOptions(field: FilterOptionsQuery["field"]) {
  return useQuery({
    queryKey: leadsQueryKeys.filterOptions(field),
    queryFn: () => leadsMockApi.getLeadFilterOptions({ field }),
  });
}
