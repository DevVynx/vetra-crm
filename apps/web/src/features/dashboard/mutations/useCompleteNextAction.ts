import { useMutation } from "@tanstack/react-query";
import type { CompleteNextActionRequest } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { useInvalidateNextActions } from "./useInvalidateNextActions";

type CompleteNextActionVariables = { id: string } & CompleteNextActionRequest;

export function useCompleteNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: ({ id, ...request }: CompleteNextActionVariables) =>
      dashboardMockApi.completeNextAction(id, request),
    onSuccess: invalidateNextActions,
  });
}
