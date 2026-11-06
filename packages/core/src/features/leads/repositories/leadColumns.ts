import { leadsTable, qualified, sql, whatsappConversationsTable } from "@vetra/database";

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
  slug: leadsTable.slug,
  doNotContact: leadsTable.doNotContact,
  autoSend: leadsTable.autoSend,
  stageId: leadsTable.stageId,
  stoppedAtStageId: leadsTable.stoppedAtStageId,
  stageChangedAt: leadsTable.stageChangedAt,
  prospectedAt: leadsTable.prospectedAt,
  lastContactAt: leadsTable.lastContactAt,
  createdAt: leadsTable.createdAt,
  updatedAt: leadsTable.updatedAt,
};

export const leadPhotoSql = sql<string | null>`(
  select ${qualified(whatsappConversationsTable.photoUrl)} from ${whatsappConversationsTable}
  where ${qualified(whatsappConversationsTable.phoneKey)} = ${qualified(leadsTable.phoneKey)}
    and ${qualified(whatsappConversationsTable.photoUrl)} is not null
  limit 1
)`;
