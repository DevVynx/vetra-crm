import { useMutation } from "@tanstack/react-query";
import type { ReorderStagesRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useReorderStages() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: (request: ReorderStagesRequest) => stagesMockApi.reorderStages(request),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível reordenar as etapas.")),
  });
}
