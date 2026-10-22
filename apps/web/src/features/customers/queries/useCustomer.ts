import { queryOptions, useQuery } from "@tanstack/react-query";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

export const customerQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: customersQueryKeys.detail(customerId),
    queryFn: () => customersMockApi.getCustomer(customerId),
    // A missing customer will not appear by retrying.
    retry: false,
  });

export function useCustomer(customerId: string) {
  return useQuery(customerQueryOptions(customerId));
}
