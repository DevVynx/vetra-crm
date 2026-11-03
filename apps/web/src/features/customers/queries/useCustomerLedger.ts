import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Filter } from "@vetra/contracts";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

const NO_FILTERS: Filter[] = [];

export const customerLedgerQueryOptions = (customerId: string, filters: Filter[]) =>
  queryOptions({
    queryKey: customersQueryKeys.ledger(customerId, filters),
    queryFn: () => customersMockApi.listCustomerLedger(customerId, { filters }),
    placeholderData: (previous) => previous,
  });

export function useCustomerLedger(customerId: string, filters: Filter[] = NO_FILTERS) {
  return useQuery(customerLedgerQueryOptions(customerId, filters));
}
