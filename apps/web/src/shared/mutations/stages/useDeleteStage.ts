import { useMutation } from "@tanstack/react-query";
import { buildPath, stagesRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useDeleteStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: (id: string) => api.delete(buildPath(stagesRoutes.byId, { id })),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível excluir a etapa.")),
  });
}
