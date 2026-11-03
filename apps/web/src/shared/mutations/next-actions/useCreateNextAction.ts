import { useMutation } from "@tanstack/react-query";
import type { CreateNextActionRequest, CreateNextActionResponse } from "@vetra/contracts";
import { nextActionsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

export function useCreateNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: async (request: CreateNextActionRequest) =>
      (await api.post<CreateNextActionResponse>(nextActionsRoutes.base, request)).data,
    onSuccess: invalidateNextActions,
  });
}
