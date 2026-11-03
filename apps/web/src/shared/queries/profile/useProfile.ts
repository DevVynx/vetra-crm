import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { profileQueryKeys } from "@/shared/queries/profile/keys";

export const profileQueryOptions = queryOptions({
  queryKey: profileQueryKeys.all,
  queryFn: async () => (await api.get<GetProfileResponse>(profileRoutes.base)).data,
});

export function useProfile() {
  return useQuery(profileQueryOptions);
}
