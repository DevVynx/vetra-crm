import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { profileMockApi } from "@/shared/mocks/profileMockApi";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileMockApi.updateProfile,
    onSuccess: (profile) => queryClient.setQueryData(profileQueryKeys.all, profile),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o perfil.")),
  });
}
