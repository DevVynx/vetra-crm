import { useQuery } from "@tanstack/react-query";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { stagesQueryKeys } from "@/shared/queries/stages/keys";

export function useStageLeadCounts() {
  return useQuery({
    queryKey: stagesQueryKeys.leadCounts,
    queryFn: () => stagesMockApi.listStageLeadCounts(),
  });
}
