import { useMutation } from "@tanstack/react-query";
import type { LeadDetail, UpdateLeadRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
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
    mutationFn: (request: UpdateLeadRequest) => leadsMockApi.updateLead(lead.id, request),
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
