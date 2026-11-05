import type { LeadDetail, LeadListItem, LeadStageState, LeadSummary } from "@vetra/contracts";
import type {
  Lead,
  LeadListRow,
  LeadStageState as DomainLeadStageState,
  LeadWithPhoto,
} from "@vetra/core";

const isoOrNull = (date: Date | null) => date?.toISOString() ?? null;

export const toLeadSummary = (lead: Lead): LeadSummary => ({
  id: lead.id,
  businessName: lead.businessName,
  contactName: lead.contactName,
  niche: lead.niche,
  city: lead.city,
  stage: lead.stageId,
  prospectedAt: lead.prospectedAt.toISOString(),
  stoppedAtStage: lead.stoppedAtStageId,
});

export const toLeadDetail = (lead: LeadWithPhoto): LeadDetail => ({
  ...toLeadSummary(lead),
  photoUrl: lead.photoUrl,
  phone: lead.phone,
  email: lead.email,
  demoUrl: lead.demoUrl,
  stageChangedAt: lead.stageChangedAt.toISOString(),
  lastContactAt: isoOrNull(lead.lastContactAt),
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString(),
});

export const toLeadListItem = (row: LeadListRow): LeadListItem => ({
  ...toLeadSummary(row),
  photoUrl: row.photoUrl,
  nextAction: row.nextAction && {
    description: row.nextAction.description,
    dueAt: row.nextAction.dueAt.toISOString(),
  },
  lastContactAt: isoOrNull(row.lastContactAt),
});

export const toLeadStageState = (state: DomainLeadStageState): LeadStageState => ({
  id: state.id,
  stage: state.stageId,
  stoppedAtStage: state.stoppedAtStageId,
  stageChangedAt: state.stageChangedAt.toISOString(),
});

export const fromLeadStageState = (state: LeadStageState): DomainLeadStageState => ({
  id: state.id,
  stageId: state.stage,
  stoppedAtStageId: state.stoppedAtStage,
  stageChangedAt: new Date(state.stageChangedAt),
});
