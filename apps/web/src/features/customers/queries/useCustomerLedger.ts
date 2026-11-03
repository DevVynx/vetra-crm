import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Filter, ListLedgerEntriesResponse } from "@vetra/contracts";
import { buildPath, ledgerRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { customersQueryKeys } from "./keys";

const NO_FILTERS: Filter[] = [];

export const customerLedgerQueryOptions = (customerId: string, filters: Filter[]) =>
  queryOptions({
    queryKey: customersQueryKeys.ledger(customerId, filters),
    queryFn: async () =>
      (
        await api.get<ListLedgerEntriesResponse>(
          buildPath(ledgerRoutes.byCustomer, { id: customerId }),
          {
            params: { filters: JSON.stringify(filters) },
          }
        )
      ).data,
    placeholderData: (previous) => previous,
  });

export function useCustomerLedger(customerId: string, filters: Filter[] = NO_FILTERS) {
  return useQuery(customerLedgerQueryOptions(customerId, filters));
}
