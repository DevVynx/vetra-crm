import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateAfterLeadChange() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}
