import { v7 as uuidv7 } from "uuid";

export type LedgerEntryType = "revenue" | "expense";
export type LedgerEntryStatus = "confirmed" | "pending";

export type LedgerEntryInput = {
  description: string;
  amountInCents: number;
  status: LedgerEntryStatus;
  // When it was confirmed, or when it is due while still pending.
  occurredAt: Date;
  projectId: string | null;
};

// A revenue entry is an installment and an expense entry is an expense; the ledger shows both.
export type LedgerEntry = LedgerEntryInput & {
  id: string;
  leadId: string;
  type: LedgerEntryType;
  createdAt: Date;
};

export type LedgerEntryWithProject = LedgerEntry & { projectName: string | null };

function create(
  leadId: string,
  type: LedgerEntryType,
  input: LedgerEntryInput,
  now: Date
): LedgerEntry {
  return { ...input, id: uuidv7(), leadId, type, createdAt: now };
}

// The type never changes: a revenue stays a revenue.
function edit(entry: LedgerEntry, input: LedgerEntryInput): LedgerEntry {
  return { ...entry, ...input };
}

// A revenue entry is stored as an installment: confirmed means paid on its date.
function installmentDatesOf(entry: LedgerEntry): { dueAt: Date; paidAt: Date | null } {
  return {
    dueAt: entry.occurredAt,
    paidAt: entry.status === "confirmed" ? entry.occurredAt : null,
  };
}

// Restoring an entry whose project was deleted meanwhile brings it back without a project.
function restoredWithProject(entry: LedgerEntry, projectStillExists: boolean): LedgerEntry {
  return projectStillExists ? entry : { ...entry, projectId: null };
}

export const ledgerDomain = { create, edit, installmentDatesOf, restoredWithProject };
