import { useQueryClient } from "@tanstack/react-query";

import { nextActionsQueryKeys } from "@/shared/queries/next-actions/keys";

export function useInvalidateNextActions() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: nextActionsQueryKeys.all });
    queryClient.invalidateQueries({ queryKey: nextActionsQueryKeys.leads });
  };
}
