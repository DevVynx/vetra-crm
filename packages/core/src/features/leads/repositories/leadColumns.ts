import { leadsTable, qualified, sql } from "@vetra/database";

export const leadColumns = {
  id: leadsTable.id,
  businessName: leadsTable.businessName,
  contactName: leadsTable.contactName,
  niche: leadsTable.niche,
  city: leadsTable.city,
  phone: leadsTable.phone,
  phoneKey: leadsTable.phoneKey,
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

export const leadPhotoSql = sql<string | null>`(
  select c.photo_url from whatsapp_conversations c
  where c.phone_key = ${qualified(leadsTable.phoneKey)} and c.photo_url is not null
  limit 1
)`;
