import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { stagesMockApi } from "@/shared/mocks/stagesMockApi";
import { useInvalidateAfterStageChange } from "@/shared/mutations/stages/useInvalidateAfterStageChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useDeleteStage() {
  const invalidate = useInvalidateAfterStageChange();

  return useMutation({
    mutationFn: (id: string) => stagesMockApi.deleteStage(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível excluir a etapa.")),
  });
}
