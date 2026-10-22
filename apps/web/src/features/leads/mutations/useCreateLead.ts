import { useMutation } from "@tanstack/react-query";
import type { CreateLeadRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCreateLead(onCreated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const remove = useMutation({
    mutationFn: (leadId: string) => leadsMockApi.deleteLead(leadId),
    onSuccess: invalidate,
  });

  return useMutation({
    mutationFn: (request: CreateLeadRequest) => leadsMockApi.createLead(request),
    onSuccess: (lead) => {
      onCreated();
      toastWithUndo("Lead criado.", () => remove.mutate(lead.id));
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar o lead.")),
  });
}
