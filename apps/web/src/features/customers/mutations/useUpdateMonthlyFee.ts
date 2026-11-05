import { useMutation } from "@tanstack/react-query";
import type { UpdateMonthlyFeeRequest } from "@vetra/contracts";
import { buildPath, customersRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useUpdateMonthlyFee(customerId: string, previous: number | null) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: (request: UpdateMonthlyFeeRequest) =>
      api.patch(buildPath(customersRoutes.monthlyFee, { id: customerId }), request),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível salvar a mensalidade.")),
  });

  const save = (monthlyFeeInCents: number | null, onSaved: () => void) =>
    mutation.mutate(
      { monthlyFeeInCents },
      {
        onSuccess: () => {
          onSaved();
          toastWithUndo(
            monthlyFeeInCents === null ? "Mensalidade removida." : "Mensalidade salva.",
            () => mutation.mutate({ monthlyFeeInCents: previous })
          );
        },
      }
    );

  return { save, isPending: mutation.isPending };
}
