import type { CustomerListFilter } from "@vetra/contracts";

export const customerFilterLabels: Record<CustomerListFilter, string> = {
  all: "Todos",
  with_active_project: "Com projeto em andamento",
  without_active_project: "Sem projeto em andamento",
};
