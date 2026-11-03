import { useMutation } from "@tanstack/react-query";
import type { CreateStageRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useCreateStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: (request: CreateStageRequest) => stagesMockApi.createStage(request),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar a etapa.")),
  });
}
