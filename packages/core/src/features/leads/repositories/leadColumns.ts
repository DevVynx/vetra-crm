import { leadsTable } from "@vetra/database";

export const leadColumns = {
  id: leadsTable.id,
  businessName: leadsTable.businessName,
  contactName: leadsTable.contactName,
  niche: leadsTable.niche,
  city: leadsTable.city,
  phone: leadsTable.phone,
  email: leadsTable.email,
  demoUrl: leadsTable.demoUrl,
  stageId: leadsTable.stageId,
  stoppedAtStageId: leadsTable.stoppedAtStageId,
  stageChangedAt: leadsTable.stageChangedAt,
  prospectedAt: leadsTable.prospectedAt,
  lastContactAt: leadsTable.lastContactAt,
  createdAt: leadsTable.createdAt,
  updatedAt: leadsTable.updatedAt,
};
