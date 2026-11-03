import type { Filter, ListCustomersQuery } from "@vetra/contracts";

export const customersQueryKeys = {
  all: ["customers"] as const,
  list: (query: ListCustomersQuery) => ["customers", "list", query] as const,
  filterOptions: (field: string) => ["customers", "filter-options", field] as const,
  detail: (customerId: string) => ["customers", "detail", customerId] as const,
  ledger: (customerId: string, filters: Filter[]) =>
    ["customers", "ledger", customerId, filters] as const,
  projects: (customerId: string) => ["customers", "projects", customerId] as const,
};
