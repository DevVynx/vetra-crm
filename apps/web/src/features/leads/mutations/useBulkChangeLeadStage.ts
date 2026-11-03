import { useMutation } from "@tanstack/react-query";
import type { LeadSummary } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

type BulkChange = { ids: string[]; stage: string };

export function useBulkChangeLeadStage(onChanged: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const restore = useMutation({
    mutationFn: (leads: LeadSummary[]) => leadsMockApi.restoreLeads(leads),
    onSuccess: invalidate,
  });

  const mutation = useMutation({
    mutationFn: ({ ids, stage }: BulkChange) => leadsMockApi.updateLeadsStage(ids, { stage }),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível alterar os leads.")),
  });

  const changeStages = (change: BulkChange, message: string) =>
    mutation.mutate(change, {
      onSuccess: (previous) => {
        onChanged();
        toastWithUndo(message, () => restore.mutate(previous));
      },
    });

  return { changeStages, isPending: mutation.isPending };
}
