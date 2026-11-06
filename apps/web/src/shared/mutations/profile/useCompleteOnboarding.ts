import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
  GetProfileResponse,
} from "@vetra/contracts";
import { profileRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { profileQueryKeys } from "@/shared/queries/profile/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const profileQuery = useQueryUtils<GetProfileResponse>(profileQueryKeys.all);

  return useMutation({
    mutationFn: async (request: CompleteOnboardingRequest) =>
      (await api.post<CompleteOnboardingResponse>(profileRoutes.onboarding, request)).data,
    onSuccess: (profile) => {
      profileQuery.setData(profile);
      // The time zone may have changed, and every date-based answer follows it.
      return queryClient.invalidateQueries();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar.")),
  });
}
