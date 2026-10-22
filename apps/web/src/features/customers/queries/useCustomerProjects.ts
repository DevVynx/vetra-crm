import { queryOptions, useQuery } from "@tanstack/react-query";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

export const customerProjectsQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: customersQueryKeys.projects(customerId),
    queryFn: () => customersMockApi.listCustomerProjects(customerId),
  });

export function useCustomerProjects(customerId: string) {
  return useQuery(customerProjectsQueryOptions(customerId));
}
