import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateAfterStageChange() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries();
}
