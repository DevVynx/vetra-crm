import { useMutation } from "@tanstack/react-query";
import type { UpdateNextActionRequest } from "@vetra/contracts";

import { dashboardMockApi } from "@/shared/mocks/mockApi";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

type UpdateNextActionVariables = { id: string } & UpdateNextActionRequest;

export function useUpdateNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: ({ id, ...request }: UpdateNextActionVariables) =>
      dashboardMockApi.updateNextAction(id, request),
    onSuccess: invalidateNextActions,
  });
}
