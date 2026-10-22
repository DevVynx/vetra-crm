import { useMutation } from "@tanstack/react-query";
import type { RescheduleNextActionRequest } from "@vetra/contracts";

import { dashboardMockApi } from "@/shared/mocks/mockApi";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

type RescheduleNextActionVariables = { id: string } & RescheduleNextActionRequest;

export function useRescheduleNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: ({ id, ...request }: RescheduleNextActionVariables) =>
      dashboardMockApi.rescheduleNextAction(id, request),
    onSuccess: invalidateNextActions,
  });
}
