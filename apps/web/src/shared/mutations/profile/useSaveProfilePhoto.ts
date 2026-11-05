import { useMutation } from "@tanstack/react-query";
import type { GetProfileResponse, UpdateProfileResponse } from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useSaveProfilePhoto() {
  const profileQuery = useQueryUtils<GetProfileResponse>(profileQueryKeys.all);

  return useMutation({
    // The photo is the body as bytes, like a file sent to WhatsApp (see API-OVERVIEW.md).
    mutationFn: async (photo: Blob) =>
      (
        await api.put<UpdateProfileResponse>(profileRoutes.photo, photo, {
          headers: { "Content-Type": "application/octet-stream" },
        })
      ).data,
    onSuccess: (profile) => profileQuery.setData(profile),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar a foto.")),
  });
}
