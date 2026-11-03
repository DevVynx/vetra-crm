import { changeLeadsStage } from "./changeLeadsStage";
import { createLead } from "./createLead";
import { deleteLead } from "./deleteLead";
import { getLead } from "./getLead";
import { listLeadFieldValues } from "./listLeadFieldValues";
import { listLeads } from "./listLeads";
import { listLeadsWithoutNextAction } from "./listLeadsWithoutNextAction";
import { restoreLeadStages } from "./restoreLeadStages";
import { updateLead } from "./updateLead";

export const leadServices = {
  changeLeadsStage,
  createLead,
  deleteLead,
  getLead,
  listLeadFieldValues,
  listLeads,
  listLeadsWithoutNextAction,
  restoreLeadStages,
  updateLead,
};
