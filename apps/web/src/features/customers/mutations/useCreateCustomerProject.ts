import { useMutation } from "@tanstack/react-query";
import type { CreateCustomerProjectRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCreateCustomerProject(customerId: string, onCreated: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  const remove = useMutation({
    mutationFn: (projectId: string) => customersMockApi.deleteCustomerProject(customerId, projectId),
    onSuccess: invalidate,
  });

  return useMutation({
    mutationFn: (request: CreateCustomerProjectRequest) =>
      customersMockApi.createCustomerProject(customerId, request),
    onSuccess: (project) => {
      onCreated();
      toastWithUndo("Projeto criado.", () => remove.mutate(project.id));
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível criar o projeto.")),
  });
}
