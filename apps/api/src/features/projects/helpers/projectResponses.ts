import type { CreateCustomerProjectRequest, CustomerProject } from "@vetra/contracts";
import type { ProjectWithFinancial } from "@vetra/core";

export const toCustomerProject = (project: ProjectWithFinancial): CustomerProject => ({
  id: project.id,
  name: project.name,
  status: project.status,
  valueInCents: project.valueInCents,
  startedAt: project.startedAt.toISOString(),
  deliveredAt: project.deliveredAt?.toISOString() ?? null,
  financial: project.financial,
});

export const fromProjectInput = (input: CreateCustomerProjectRequest) => ({
  ...input,
  startedAt: new Date(input.startedAt),
});
