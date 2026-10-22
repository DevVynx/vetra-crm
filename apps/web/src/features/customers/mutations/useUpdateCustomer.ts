import { useMutation } from "@tanstack/react-query";
import type { CustomerDetail, UpdateCustomerRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

const toRequest = (customer: CustomerDetail): UpdateCustomerRequest => ({
  businessName: customer.businessName,
  contactName: customer.contactName,
  niche: customer.niche,
  city: customer.city,
  phone: customer.phone,
  email: customer.email,
  document: customer.document,
});

export function useUpdateCustomer(customer: CustomerDetail, onUpdated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const mutation = useMutation({
    mutationFn: (request: UpdateCustomerRequest) =>
      customersMockApi.updateCustomer(customer.id, request),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar o cliente.")),
  });

  const save = (request: UpdateCustomerRequest) => {
    const previous = toRequest(customer);
    mutation.mutate(request, {
      onSuccess: () => {
        onUpdated();
        toastWithUndo("Cliente atualizado.", () => mutation.mutate(previous));
      },
    });
  };

  return { save, isPending: mutation.isPending };
}
