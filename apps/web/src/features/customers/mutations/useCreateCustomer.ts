import { useMutation } from "@tanstack/react-query";
import type { CreateCustomerRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCreateCustomer(onCreated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const remove = useMutation({
    mutationFn: (customerId: string) => customersMockApi.deleteCustomer(customerId),
    onSuccess: invalidate,
  });

  return useMutation({
    mutationFn: (request: CreateCustomerRequest) => customersMockApi.createCustomer(request),
    onSuccess: (customer) => {
      onCreated();
      toastWithUndo("Cliente criado.", () => remove.mutate(customer.id));
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar o cliente.")),
  });
}
