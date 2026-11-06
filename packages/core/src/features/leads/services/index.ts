import { changeLeadsStage } from "./changeLeadsStage";
import { createLead } from "./createLead";
import { deleteLead } from "./deleteLead";
import { getLead } from "./getLead";
import { listLeadFieldValues } from "./listLeadFieldValues";
import { listLeadIds } from "./listLeadIds";
import { listLeads } from "./listLeads";
import { listLeadsWithoutNextAction } from "./listLeadsWithoutNextAction";
import { lookupLeads } from "./lookupLeads";
import { restoreLeadStages } from "./restoreLeadStages";
import { updateLead } from "./updateLead";
import { updateLeadAutoSend } from "./updateLeadAutoSend";
import { updateLeadDoNotContact } from "./updateLeadDoNotContact";
import { upsertLeadBySlug } from "./upsertLeadBySlug";

export const leadServices = {
  changeLeadsStage,
  createLead,
  deleteLead,
  getLead,
  listLeadFieldValues,
  listLeadIds,
  listLeads,
  listLeadsWithoutNextAction,
  lookupLeads,
  restoreLeadStages,
  updateLead,
  updateLeadAutoSend,
  updateLeadDoNotContact,
  upsertLeadBySlug,
};
