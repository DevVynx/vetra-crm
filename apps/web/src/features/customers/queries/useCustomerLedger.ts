import { queryOptions, useQuery } from "@tanstack/react-query";

import { customersMockApi } from "@/shared/mocks/customersMockApi";

import { customersQueryKeys } from "./keys";

export const customerLedgerQueryOptions = (customerId: string) =>
  queryOptions({
    queryKey: customersQueryKeys.ledger(customerId),
    queryFn: () => customersMockApi.listCustomerLedger(customerId),
  });

export function useCustomerLedger(customerId: string) {
  return useQuery(customerLedgerQueryOptions(customerId));
}
