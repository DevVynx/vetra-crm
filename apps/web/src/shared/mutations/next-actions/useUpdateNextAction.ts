import { useMutation } from "@tanstack/react-query";
import type { UpdateNextActionRequest, UpdateNextActionResponse } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

type UpdateNextActionVariables = { id: string } & UpdateNextActionRequest;

export function useUpdateNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: async ({ id, ...request }: UpdateNextActionVariables) =>
      (
        await api.patch<UpdateNextActionResponse>(
          buildPath(nextActionsRoutes.byId, { id }),
          request
        )
      ).data,
    onSuccess: invalidateNextActions,
  });
}
