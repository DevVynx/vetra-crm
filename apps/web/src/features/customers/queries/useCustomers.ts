import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import type { ListCustomersQuery } from "@vetra/contracts";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

export const customersQueryOptions = (query: ListCustomersQuery) =>
  queryOptions({
    queryKey: customersQueryKeys.list(query),
    queryFn: () => customersMockApi.listCustomers(query),
    placeholderData: keepPreviousData,
  });

export function useCustomers(
  query: ListCustomersQuery,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({ ...customersQueryOptions(query), enabled });
}
