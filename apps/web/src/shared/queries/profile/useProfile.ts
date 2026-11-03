import { useQuery } from "@tanstack/react-query";

import { profileMockApi } from "@/shared/mocks/profileMockApi";
import { profileQueryKeys } from "@/shared/queries/profile/keys";

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.all,
    queryFn: () => profileMockApi.getProfile(),
  });
}
