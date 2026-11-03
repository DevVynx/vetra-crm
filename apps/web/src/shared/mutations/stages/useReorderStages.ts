import { useMutation } from "@tanstack/react-query";
import type { ReorderStagesRequest, ReorderStagesResponse } from "@vetra/contracts";
import { stagesRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useReorderStages() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: async (request: ReorderStagesRequest) =>
      (await api.put<ReorderStagesResponse>(stagesRoutes.order, request)).data,
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível reordenar as etapas.")),
  });
}
