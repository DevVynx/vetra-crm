import { queryOptions, useQuery } from "@tanstack/react-query";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { stagesQueryKeys } from "@/shared/queries/stages/keys";

export const stagesQueryOptions = queryOptions({
  queryKey: stagesQueryKeys.all,
  queryFn: () => stagesMockApi.listStages(),
});

export function useStagesQuery() {
  return useQuery(stagesQueryOptions);
}
