import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListCustomerProjectsResponse } from "@vetra/contracts";
import { buildPath, projectsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { customersQueryKeys } from "./keys";

export const customerProjectsQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: customersQueryKeys.projects(customerId),
    queryFn: async () =>
      (
        await api.get<ListCustomerProjectsResponse>(
          buildPath(projectsRoutes.byCustomer, { id: customerId })
        )
      ).data,
  });

export function useCustomerProjects(customerId: string) {
  return useQuery(customerProjectsQueryOptions(customerId));
}
