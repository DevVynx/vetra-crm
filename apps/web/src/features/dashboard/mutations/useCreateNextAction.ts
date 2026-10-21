import { useMutation } from "@tanstack/react-query";
import type { CreateNextActionRequest } from "@vetra/contracts";

import { dashboardMockApi } from "../mocks/mockApi";
import { useInvalidateNextActions } from "./useInvalidateNextActions";

export function useCreateNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: (request: CreateNextActionRequest) => dashboardMockApi.createNextAction(request),
    onSuccess: invalidateNextActions,
  });
}
