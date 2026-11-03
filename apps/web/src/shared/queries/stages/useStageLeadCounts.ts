import { useQuery } from "@tanstack/react-query";
import type { ListStageLeadCountsResponse } from "@vetra/contracts";
import { stagesRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { stagesQueryKeys } from "@/shared/queries/stages/keys";

export function useStageLeadCounts() {
  return useQuery({
    queryKey: stagesQueryKeys.leadCounts,
    queryFn: async () => (await api.get<ListStageLeadCountsResponse>(stagesRoutes.leadCounts)).data,
  });
}
