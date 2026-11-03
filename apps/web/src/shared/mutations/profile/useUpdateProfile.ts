import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileRequest, UpdateProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) =>
      (await api.patch<UpdateProfileResponse>(profileRoutes.base, request)).data,
    onSuccess: (profile) => queryClient.setQueryData(profileQueryKeys.all, profile),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o perfil.")),
  });
}
