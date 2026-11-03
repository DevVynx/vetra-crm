import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListStagesResponse } from "@vetra/contracts";
import { stagesRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { stagesQueryKeys } from "@/shared/queries/stages/keys";

export const stagesQueryOptions = queryOptions({
  queryKey: stagesQueryKeys.all,
  queryFn: async () => (await api.get<ListStagesResponse>(stagesRoutes.base)).data,
});

export function useStagesQuery() {
  return useQuery(stagesQueryOptions);
}
