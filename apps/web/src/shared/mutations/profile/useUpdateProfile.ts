import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const profileQuery = useQueryUtils<GetProfileResponse>(profileQueryKeys.all);

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) =>
      (await api.patch<UpdateProfileResponse>(profileRoutes.base, request)).data,
    onSuccess: (profile, request) => {
      profileQuery.setData(profile);
      // The server draws "today", periods and chart buckets in the profile time zone, so every
      // date-based answer changes with it.
      if (request.timeZone) return queryClient.invalidateQueries();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o perfil.")),
  });
}
