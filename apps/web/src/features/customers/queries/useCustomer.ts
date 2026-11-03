import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetCustomerResponse } from "@vetra/contracts";
import { buildPath, customersRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { customersQueryKeys } from "./keys";

export const customerQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: customersQueryKeys.detail(customerId),
    queryFn: async () =>
      (await api.get<GetCustomerResponse>(buildPath(customersRoutes.byId, { id: customerId })))
        .data,
    // A missing customer will not appear by retrying.
    retry: false,
  });

export function useCustomer(customerId: string) {
  return useQuery(customerQueryOptions(customerId));
}
