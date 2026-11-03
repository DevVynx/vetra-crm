import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { ListCustomersQuery, ListCustomersResponse } from "@vetra/contracts";
import { customersRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { customersQueryKeys } from "./keys";

export const customersQueryOptions = (query: ListCustomersQuery) =>
  queryOptions({
    queryKey: customersQueryKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ListCustomersResponse>(customersRoutes.base, {
          params: { ...query, filters: JSON.stringify(query.filters) },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export function useCustomers(
  query: ListCustomersQuery,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({ ...customersQueryOptions(query), enabled });
}
