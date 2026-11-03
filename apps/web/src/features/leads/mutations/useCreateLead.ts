import { useMutation } from "@tanstack/react-query";
import type { CreateLeadRequest, CreateLeadResponse } from "@vetra/contracts";
import { buildPath, leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCreateLead(onCreated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const remove = useMutation({
    mutationFn: (leadId: string) => api.delete(buildPath(leadsRoutes.byId, { id: leadId })),
    onSuccess: invalidate,
  });

  return useMutation({
    mutationFn: async (request: CreateLeadRequest) =>
      (await api.post<CreateLeadResponse>(leadsRoutes.base, request)).data,
    onSuccess: (lead) => {
      onCreated();
      toastWithUndo("Lead criado.", () => remove.mutate(lead.id));
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar o lead.")),
  });
}
