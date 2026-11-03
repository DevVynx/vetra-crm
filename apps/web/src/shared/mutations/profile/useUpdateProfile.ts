import { useMutation } from "@tanstack/react-query";
import type { Profile, UpdateProfileRequest, UpdateProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useUpdateProfile() {
  const profileQuery = useQueryUtils<Profile>(profileQueryKeys.all);

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) =>
      (await api.patch<UpdateProfileResponse>(profileRoutes.base, request)).data,
    onSuccess: (profile) => profileQuery.setData(profile),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o perfil.")),
  });
}
