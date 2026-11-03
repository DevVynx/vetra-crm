import type { LedgerEntry, UpdateLedgerEntryRequest } from "@vetra/contracts";
import type { LedgerEntry as DomainLedgerEntry, LedgerEntryWithProject } from "@vetra/core";

export const toLedgerEntry = (entry: LedgerEntryWithProject): LedgerEntry => ({
  id: entry.id,
  type: entry.type,
  description: entry.description,
  amountInCents: entry.amountInCents,
  status: entry.status,
  occurredAt: entry.occurredAt.toISOString(),
  createdAt: entry.createdAt.toISOString(),
  projectId: entry.projectId,
  projectName: entry.projectName,
});

export const fromLedgerEntryInput = (input: UpdateLedgerEntryRequest) => ({
  ...input,
  occurredAt: new Date(input.occurredAt),
});

export const fromLedgerEntry = (leadId: string, entry: LedgerEntry): DomainLedgerEntry => ({
  id: entry.id,
  leadId,
  type: entry.type,
  description: entry.description,
  amountInCents: entry.amountInCents,
  status: entry.status,
  occurredAt: new Date(entry.occurredAt),
  createdAt: new Date(entry.createdAt),
  projectId: entry.projectId,
});
