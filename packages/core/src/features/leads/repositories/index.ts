import { countLeadsByStage } from "./countLeadsByStage";
import { deleteLead } from "./deleteLead";
import { findLeadById } from "./findLeadById";
import { findLeadBySlug } from "./findLeadBySlug";
import { findLeadFieldValues } from "./findLeadFieldValues";
import { findLeadIdByPhoneKey } from "./findLeadIdByPhoneKey";
import { findLeadIds } from "./findLeadIds";
import { findLeadsByIds } from "./findLeadsByIds";
import { findLeadLookupRow, findLeadsForLookup } from "./findLeadsForLookup";
import { findLeadsPage } from "./findLeadsPage";
import { findLeadsWithoutNextAction } from "./findLeadsWithoutNextAction";
import { insertLead } from "./insertLead";
import { insertLeadWithNextAction } from "./insertLeadWithNextAction";
import { moveLeadsToStage } from "./moveLeadsToStage";
import { saveLeadStages } from "./saveLeadStages";
import { setLeadDoNotContact } from "./setLeadDoNotContact";
import { updateLeadContact } from "./updateLeadContact";
import { updateLeadFromPipeline } from "./updateLeadFromPipeline";

export type { LeadLookupCriteria, LeadLookupMatch, LeadLookupRow } from "./findLeadsForLookup";
export type { LeadListRow } from "./findLeadsPage";

export const leadRepositories = {
  countLeadsByStage,
  deleteLead,
  findLeadById,
  findLeadBySlug,
  findLeadLookupRow,
  findLeadIdByPhoneKey,
  findLeadFieldValues,
  findLeadIds,
  findLeadsByIds,
  findLeadsForLookup,
  findLeadsPage,
  findLeadsWithoutNextAction,
  insertLead,
  insertLeadWithNextAction,
  moveLeadsToStage,
  saveLeadStages,
  setLeadDoNotContact,
  updateLeadContact,
  updateLeadFromPipeline,
};
