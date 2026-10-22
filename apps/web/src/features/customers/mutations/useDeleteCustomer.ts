import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

import { customersQueryKeys } from "../queries/keys";

export function useDeleteCustomer(customerId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const invalidate = useInvalidateAfterLeadChange();

  return useMutation({
    mutationFn: () => customersMockApi.deleteCustomer(customerId),
    onSuccess: async () => {
      // Drop the details first: refetching a deleted customer would flash "not found".
      queryClient.removeQueries({ queryKey: customersQueryKeys.detail(customerId) });
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(customerId) });
      await navigate({ to: "/customers" });
      toast.success("Cliente excluído.");
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível excluir o cliente.")),
  });
}
