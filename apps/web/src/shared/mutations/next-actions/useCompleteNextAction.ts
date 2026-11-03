import { useMutation } from "@tanstack/react-query";
import type { CompleteNextActionRequest, CompleteNextActionResponse } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

type CompleteNextActionVariables = { id: string } & CompleteNextActionRequest;

export function useCompleteNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: async ({ id, ...request }: CompleteNextActionVariables) =>
      (
        await api.post<CompleteNextActionResponse>(
          buildPath(nextActionsRoutes.complete, { id }),
          request
        )
      ).data,
    onSuccess: invalidateNextActions,
  });
}
