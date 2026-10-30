import type { ListCustomersQuery } from "@vetra/contracts";

export const customersQueryKeys = {
  all: ["customers"] as const,
  list: (query: ListCustomersQuery) => ["customers", "list", query] as const,
  filterOptions: (field: string) => ["customers", "filter-options", field] as const,
  detail: (customerId: string) => ["customers", "detail", customerId] as const,
  ledger: (customerId: string) => ["customers", "ledger", customerId] as const,
  projects: (customerId: string) => ["customers", "projects", customerId] as const,
};
