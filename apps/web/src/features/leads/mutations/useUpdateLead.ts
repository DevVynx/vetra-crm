import { useMutation } from "@tanstack/react-query";
import type { LeadDetail, UpdateLeadRequest, UpdateLeadResponse } from "@vetra/contracts";
import { buildPath, leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

const toRequest = (lead: LeadDetail): UpdateLeadRequest => ({
  businessName: lead.businessName,
  contactName: lead.contactName,
  niche: lead.niche,
  city: lead.city,
  phone: lead.phone,
  email: lead.email,
});

export function useUpdateLead(lead: LeadDetail, onUpdated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: async (request: UpdateLeadRequest) =>
      (await api.patch<UpdateLeadResponse>(buildPath(leadsRoutes.byId, { id: lead.id }), request))
        .data,
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o lead.")),
  });

  const save = (request: UpdateLeadRequest) => {
    const previous = toRequest(lead);
    mutation.mutate(request, {
      onSuccess: () => {
        onUpdated();
        toastWithUndo("Lead atualizado.", () => mutation.mutate(previous));
      },
    });
  };

  return { save, isPending: mutation.isPending };
}
