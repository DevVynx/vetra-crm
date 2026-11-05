import type { ListLeadIdsQuery, ListLeadsQuery } from "@vetra/contracts";

export const leadsQueryKeys = {
  all: ["leads"] as const,
  list: (query: ListLeadsQuery) => ["leads", "list", query] as const,
  ids: (query: ListLeadIdsQuery) => ["leads", "ids", query] as const,
  filterOptions: (field: string) => ["leads", "filter-options", field] as const,
  detail: (leadId: string) => ["leads", "detail", leadId] as const,
  notes: (leadId: string) => ["leads", "notes", leadId] as const,
  // Under "next-actions" so completing or rescheduling anywhere refreshes it.
  nextActions: (leadId: string) => ["next-actions", "lead", leadId] as const,
};
