import type { LeadNote } from "@vetra/contracts";
import type { LeadNote as DomainLeadNote } from "@vetra/core";

export const toLeadNote = (note: DomainLeadNote): LeadNote => ({
  id: note.id,
  leadId: note.leadId,
  content: note.content,
  createdAt: note.createdAt.toISOString(),
});

export const fromLeadNote = (note: LeadNote): DomainLeadNote => ({
  ...note,
  createdAt: new Date(note.createdAt),
});
