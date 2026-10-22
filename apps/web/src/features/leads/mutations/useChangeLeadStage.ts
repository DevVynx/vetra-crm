import { useMutation } from "@tanstack/react-query";
import type { LeadStage, UpdateLeadStageRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

type Stage = UpdateLeadStageRequest["stage"];

export function useChangeLeadStage(leadId: string) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: (stage: Stage) => leadsMockApi.updateLeadStage(leadId, { stage }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível alterar a etapa.")),
  });

  const changeStage = (next: Stage, previous: LeadStage, message: string) =>
    mutation.mutate(next, {
      onSuccess: () => {
        if (previous === "won") return toast.success(message);
        toastWithUndo(message, () => mutation.mutate(previous));
      },
    });

  return { changeStage, isPending: mutation.isPending };
}
