import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateAutomationSettingsRequest,
  UpdateAutomationSettingsResponse,
} from "@vetra/contracts";
import { automationsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { automationsQueryKeys } from "@/shared/queries/automations/useAutomationSettings";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useUpdateAutomationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UpdateAutomationSettingsRequest) =>
      (await api.patch<UpdateAutomationSettingsResponse>(automationsRoutes.base, settings)).data,
    onSuccess: (settings) => queryClient.setQueryData(automationsQueryKeys.all, settings),
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível salvar as automações.")),
  });
}
