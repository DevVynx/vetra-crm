import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { useStages } from "@/shared/stages/useStages";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useChangeLeadStage(leadId: string) {
  const stages = useStages();
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: (stage: string) => leadsMockApi.updateLeadStage(leadId, { stage }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível alterar a etapa.")),
  });

  const changeStage = (next: string, previous: string, message: string) =>
    mutation.mutate(next, {
      onSuccess: () => {
        if (stages.isClosing(previous)) return toast.success(message);
        toastWithUndo(message, () => mutation.mutate(previous));
      },
    });

  return { changeStage, isPending: mutation.isPending };
}
