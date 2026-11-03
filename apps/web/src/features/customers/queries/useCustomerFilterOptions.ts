import { useQuery } from "@tanstack/react-query";
import type { FilterOptionsQuery, FilterOptionsResponse } from "@vetra/contracts";
import { customersRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { customersQueryKeys } from "./keys";

export function useCustomerFilterOptions(field: FilterOptionsQuery["field"]) {
  return useQuery({
    queryKey: customersQueryKeys.filterOptions(field),
    queryFn: async () =>
      (await api.get<FilterOptionsResponse>(customersRoutes.filterOptions, { params: { field } }))
        .data,
  });
}
