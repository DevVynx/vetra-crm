import { useMutation } from "@tanstack/react-query";
import type { LeadStageState, UpdateLeadsStageResponse } from "@vetra/contracts";
import { leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { useStages } from "@/shared/stages/useStages";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useChangeLeadStage(leadId: string) {
  const stages = useStages();
  const invalidate = useInvalidateAfterLeadChange();

  // Goes through the bulk route, which returns the previous state the undo needs to restore
  // the stage change date as well, not only the stage.
  const mutation = useMutation({
    mutationFn: async (stage: string) =>
      (await api.patch<UpdateLeadsStageResponse>(leadsRoutes.stage, { ids: [leadId], stage })).data,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível alterar a etapa.")),
  });

  const restore = useMutation({
    mutationFn: (leads: LeadStageState[]) => api.post(leadsRoutes.stageRestore, { leads }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível desfazer.")),
  });

  const changeStage = (next: string, previous: string, message: string) =>
    mutation.mutate(next, {
      onSuccess: ({ previous: states }) => {
        if (stages.isClosing(previous)) return toast.success(message);
        toastWithUndo(message, () => restore.mutate(states));
      },
    });

  return { changeStage, isPending: mutation.isPending };
}
