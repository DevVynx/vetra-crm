import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { isClientError, isConnectionProblem, reportFailure } from "@/shared/connection/serverCheck";

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error) => void reportFailure(error) }),
  mutationCache: new MutationCache({ onError: (error) => void reportFailure(error) }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,
      // Only a failure that may pass is asked again: a server that doesn't answer is left to the
      // notice, and one that said no (a 404, a 409) would say it again, only later.
      retry: (failureCount, error) =>
        failureCount < MAX_RETRIES && !isConnectionProblem(error) && !isClientError(error),
    },
  },
});
