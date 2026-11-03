import { useQuery } from "@tanstack/react-query";
import type { GetProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { profileQueryKeys } from "@/shared/queries/profile/keys";

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.all,
    queryFn: async () => (await api.get<GetProfileResponse>(profileRoutes.base)).data,
  });
}
