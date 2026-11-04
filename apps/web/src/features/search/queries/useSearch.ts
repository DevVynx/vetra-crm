import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SEARCH_MIN_LENGTH, type SearchResponse } from "@vetra/contracts";
import { searchRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

// Debounced by the caller. The previous results stay until the new ones arrive, so the list doesn't
// blink on every pause while typing; retrying would only delay the error while the user waits.
export function useSearch(term: string) {
  return useQuery({
    queryKey: ["search", term],
    queryFn: async () =>
      (await api.get<SearchResponse>(searchRoutes.base, { params: { q: term } })).data,
    enabled: term.length >= SEARCH_MIN_LENGTH,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
