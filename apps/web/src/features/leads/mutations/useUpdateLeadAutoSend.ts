import { useMutation } from "@tanstack/react-query";
import type { UpdateLeadAutoSendRequest, UpdateLeadResponse } from "@vetra/contracts";
import { buildPath, leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useUpdateLeadAutoSend(leadId: string) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: async (autoSend: boolean) => {
      const request: UpdateLeadAutoSendRequest = { autoSend };

      return (
        await api.patch<UpdateLeadResponse>(
          buildPath(leadsRoutes.autoSend, { id: leadId }),
          request
        )
      ).data;
    },
    onSuccess: invalidate,
    onError: () => toast.error("Não foi possível alterar o envio automático."),
  });

  const change = (autoSend: boolean) =>
    mutation.mutate(autoSend, {
      onSuccess: () =>
        toastWithUndo(
          autoSend ? "Envio automático ligado para este lead." : "Envio automático desligado.",
          () => mutation.mutate(!autoSend)
        ),
    });

  return { change, isPending: mutation.isPending };
}
