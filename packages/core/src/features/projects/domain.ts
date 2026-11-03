import { v7 as uuidv7 } from "uuid";

export type ProjectStatus = "in_production" | "delivered";

export type ProjectInput = {
  name: string;
  status: ProjectStatus;
  valueInCents: number;
  startedAt: Date;
};

export type Project = ProjectInput & {
  id: string;
  leadId: string;
  deliveredAt: Date | null;
};

// Money of the ledger entries linked to the project, computed by the database.
export type ProjectFinancial = {
  receivedInCents: number;
  pendingInCents: number;
  expensesInCents: number;
  linkedEntriesCount: number;
};

export type ProjectWithFinancial = Project & { financial: ProjectFinancial };

function create(leadId: string, input: ProjectInput, now: Date): Project {
  return {
    ...input,
    id: uuidv7(),
    leadId,
    deliveredAt: input.status === "delivered" ? now : null,
  };
}

// The delivery date is set the first time the project is marked delivered and kept while it
// stays delivered; reopening the project clears it.
function edit(project: Project, input: ProjectInput, now: Date): Project {
  const deliveredAt = input.status === "delivered" ? (project.deliveredAt ?? now) : null;
  return { ...project, ...input, deliveredAt };
}

export const projectDomain = { create, edit };
