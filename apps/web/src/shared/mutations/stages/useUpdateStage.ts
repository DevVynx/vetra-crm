import { useMutation } from "@tanstack/react-query";
import type { UpdateStageRequest, UpdateStageResponse } from "@vetra/contracts";
import { buildPath, stagesRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type UpdateStageVariables = { id: string } & UpdateStageRequest;

export function useUpdateStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: async ({ id, ...request }: UpdateStageVariables) =>
      (await api.patch<UpdateStageResponse>(buildPath(stagesRoutes.byId, { id }), request)).data,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar a etapa.")),
  });
}
