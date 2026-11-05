import { useMutation } from "@tanstack/react-query";
import type {
  CustomerDetail,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
} from "@vetra/contracts";
import { buildPath, customersRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { contactErrorMessage } from "@/shared/utils/contactForm";
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
    mutationFn: async (request: UpdateCustomerRequest) =>
      (
        await api.patch<UpdateCustomerResponse>(
          buildPath(customersRoutes.byId, { id: customer.id }),
          request
        )
      ).data,
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(contactErrorMessage(error, "Não foi possível salvar o cliente.")),
  });

  const save = (request: UpdateCustomerRequest) => {
    const previous = toRequest(customer);
    mutation.mutate(request, {
      onSuccess: () => {
        onUpdated();
        toastWithUndo("Cliente atualizado com sucesso.", () => mutation.mutate(previous));
      },
    });
  };

  return { save, isPending: mutation.isPending };
}
