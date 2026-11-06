import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { isConnectionProblem, reportFailure } from "@/shared/connection/serverCheck";

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => void reportFailure(error) }),
  mutationCache: new MutationCache({ onError: (error) => void reportFailure(error) }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,
      // A server that doesn't answer isn't asked three more times: the notice takes over.
      retry: (failureCount, error) => failureCount < MAX_RETRIES && !isConnectionProblem(error),
    },
  },
});
