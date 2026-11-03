import { useMutation } from "@tanstack/react-query";
import type { CreateStageRequest, CreateStageResponse } from "@vetra/contracts";
import { stagesRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useCreateStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: async (request: CreateStageRequest) =>
      (await api.post<CreateStageResponse>(stagesRoutes.base, request)).data,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar a etapa.")),
  });
}
