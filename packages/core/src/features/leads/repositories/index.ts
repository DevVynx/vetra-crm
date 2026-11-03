import { countLeadsByStage } from "./countLeadsByStage";
import { deleteLead } from "./deleteLead";
import { findLeadById } from "./findLeadById";
import { findLeadFieldValues } from "./findLeadFieldValues";
import { findLeadsByIds } from "./findLeadsByIds";
import { findLeadsPage } from "./findLeadsPage";
import { findLeadsWithoutNextAction } from "./findLeadsWithoutNextAction";
import { insertLead } from "./insertLead";
import { moveLeadsToStage } from "./moveLeadsToStage";
import { saveLeadStages } from "./saveLeadStages";
import { updateLeadContact } from "./updateLeadContact";

export type { LeadListRow } from "./findLeadsPage";

export const leadRepositories = {
  countLeadsByStage,
  deleteLead,
  findLeadById,
  findLeadFieldValues,
  findLeadsByIds,
  findLeadsPage,
  findLeadsWithoutNextAction,
  insertLead,
  moveLeadsToStage,
  saveLeadStages,
  updateLeadContact,
};
