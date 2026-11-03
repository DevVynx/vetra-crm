import { useMutation } from "@tanstack/react-query";
import type { LeadStageState, UpdateLeadsStageResponse } from "@vetra/contracts";
import { leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

type BulkChange = { ids: string[]; stage: string };

export function useBulkChangeLeadStage(onChanged: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  // Undo writes back each lead's previous stage, stopped-at stage and stage change date.
  const restore = useMutation({
    mutationFn: (leads: LeadStageState[]) => api.post(leadsRoutes.stageRestore, { leads }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível desfazer.")),
  });

  const mutation = useMutation({
    mutationFn: async (change: BulkChange) =>
      (await api.patch<UpdateLeadsStageResponse>(leadsRoutes.stage, change)).data,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível alterar os leads.")),
  });

  const changeStages = (change: BulkChange, message: string) =>
    mutation.mutate(change, {
      onSuccess: ({ previous }) => {
        onChanged();
        toastWithUndo(message, () => restore.mutate(previous));
      },
    });

  return { changeStages, isPending: mutation.isPending };
}
