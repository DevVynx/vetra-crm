import { useMutation } from "@tanstack/react-query";
import type { GetProfileResponse, UpdateProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useRemoveProfilePhoto() {
  const profileQuery = useQueryUtils<GetProfileResponse>(profileQueryKeys.all);

  return useMutation({
    mutationFn: async () => (await api.delete<UpdateProfileResponse>(profileRoutes.photo)).data,
    onSuccess: (profile) => profileQuery.setData(profile),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível remover a foto.")),
  });
}
