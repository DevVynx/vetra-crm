import { useQuery } from "@tanstack/react-query";
import type { FilterOptionsQuery } from "@vetra/contracts";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

export function useCustomerFilterOptions(field: FilterOptionsQuery["field"]) {
  return useQuery({
    queryKey: customersQueryKeys.filterOptions(field),
    queryFn: () => customersMockApi.getCustomerFilterOptions({ field }),
  });
}
