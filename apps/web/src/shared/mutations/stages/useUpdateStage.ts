import { useMutation } from "@tanstack/react-query";
import type { UpdateStageRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type UpdateStageVariables = { id: string } & UpdateStageRequest;

export function useUpdateStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: ({ id, ...request }: UpdateStageVariables) =>
      stagesMockApi.updateStage(id, request),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar a etapa.")),
  });
}
