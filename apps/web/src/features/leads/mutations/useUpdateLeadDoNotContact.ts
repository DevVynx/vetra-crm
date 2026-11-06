import { useMutation } from "@tanstack/react-query";
import type { UpdateLeadDoNotContactRequest, UpdateLeadResponse } from "@vetra/contracts";
import { buildPath, leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useUpdateLeadDoNotContact(leadId: string) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: async (doNotContact: boolean) => {
      const request: UpdateLeadDoNotContactRequest = { doNotContact };

      return (
        await api.patch<UpdateLeadResponse>(
          buildPath(leadsRoutes.doNotContact, { id: leadId }),
          request
        )
      ).data;
    },
    onSuccess: invalidate,
    onError: () => toast.error("Não foi possível alterar a marcação."),
  });

  const change = (doNotContact: boolean) =>
    mutation.mutate(doNotContact, {
      onSuccess: () =>
        toastWithUndo(doNotContact ? "Marcado como não contatar." : "Contato liberado.", () =>
          mutation.mutate(!doNotContact)
        ),
    });

  return { change, isPending: mutation.isPending };
}
