import { useMutation } from "@tanstack/react-query";
import type { CreateCustomerRequest, CreateCustomerResponse } from "@vetra/contracts";
import { buildPath, customersRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCreateCustomer(onCreated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const remove = useMutation({
    mutationFn: (customerId: string) =>
      api.delete(buildPath(customersRoutes.byId, { id: customerId })),
    onSuccess: invalidate,
  });

  return useMutation({
    mutationFn: async (request: CreateCustomerRequest) =>
      (await api.post<CreateCustomerResponse>(customersRoutes.base, request)).data,
    onSuccess: (customer) => {
      onCreated();
      toastWithUndo("Cliente criado.", () => remove.mutate(customer.id));
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar o cliente.")),
  });
}
